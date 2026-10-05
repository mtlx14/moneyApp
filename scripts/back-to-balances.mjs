// Migración de una sola vez: las cuentas dejan de llevar movimientos y vuelven
// al saldo escrito a mano. Deshace migrate-initial-balance y drop-sub-accounts:
//
//   - cada cuenta con isLedger guarda en `balance` lo que suman hoy sus
//     transacciones y pierde el flag,
//   - Por pagar y Currently vuelven a tener sub-cuentas: se recrean Uber, Didi y
//     Cabify en cada una, con lo que suman hoy sus movimientos de esa categoría,
//     y las dos cuentas grandes vuelven a hasSubAccount con saldo 0.
//
//   node scripts/back-to-balances.mjs          (simulacro, no escribe)
//   node scripts/back-to-balances.mjs --apply  (escribe)
//
// Es idempotente: una cuenta sin isLedger ya está hecha y se saltea. La
// colección `transactions` no se toca: queda como respaldo.

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, getDocs, writeBatch, deleteField } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyAEoxLLMqVf7IE1wjl9PR3j5eSiadkMbzY',
  authDomain: 'moneyapp-452ab.firebaseapp.com',
  projectId: 'moneyapp-452ab',
  storageBucket: 'moneyapp-452ab.firebasestorage.app',
  messagingSenderId: '834278591547',
  appId: '1:834278591547:web:005a3b9dae24f29b0e201e',
};

// las cuentas grandes y el sufijo de sus sub-cuentas, como eran antes
const RIDE_ACCOUNTS = {
  m_account_to_be_paid: 'to_be_paid',
  m_account_currently: 'currently',
};
const RIDES = [
  { key: 'uber', name: 'Uber', emoji: '🚗' },
  { key: 'didi', name: 'Didi', emoji: '🛻' },
  { key: 'cabify', name: 'Cabify', emoji: '🚙' },
];
const TRANSFER_TYPES = ['transfer', 'user_transfer'];

// lo que aporta una transacción a una cuenta: lo mismo que hacía el contexto
const signedAmountFor = (tx, accountId) => {
  if (TRANSFER_TYPES.includes(tx.type) && tx.toAccountId === accountId) return tx.amount;
  if (tx.accountId !== accountId) return 0;
  return tx.type === 'income' || tx.type === 'initial' ? tx.amount : -tx.amount;
};
const touches = (tx, accountId) => tx.accountId === accountId || (TRANSFER_TYPES.includes(tx.type) && tx.toAccountId === accountId);
const money = (n) => `$${n.toLocaleString('es-CL')}`;

const apply = process.argv.includes('--apply');

const db = getFirestore(initializeApp(firebaseConfig));
const accountsSnap = await getDocs(collection(db, 'accounts'));
const txs = (await getDocs(collection(db, 'transactions'))).docs.map((d) => ({ id: d.id, ...d.data() }));
const categories = (await getDocs(collection(db, 'categories'))).docs.map((d) => ({ id: d.id, ...d.data() }));
const accountIds = accountsSnap.docs.map((d) => d.id);

const batch = writeBatch(db);
let writes = 0;

for (const snap of accountsSnap.docs) {
  const id = snap.id;
  const account = snap.data();

  if (!account.isLedger) continue;

  const own = txs.filter((tx) => touches(tx, id));

  // las de transporte reparten sus movimientos en sub-cuentas
  if (RIDE_ACCOUNTS[id]) {
    let assigned = 0;
    for (const ride of RIDES) {
      const categoryIds = categories.filter((c) => c.label === ride.name).map((c) => c.id);
      const balance = own.filter((tx) => categoryIds.includes(tx.category)).reduce((sum, tx) => sum + signedAmountFor(tx, id), 0);
      assigned += balance;
      const subId = `m_sub_account_${ride.key}_${RIDE_ACCOUNTS[id]}`;
      batch.set(doc(db, 'accounts', subId), { name: ride.name, emoji: ride.emoji, type: 'sub_account', forAccount: id, balance, isActive: balance !== 0 }, { merge: true });
      writes += 1;
      console.log(`  ✓ ${subId.padEnd(32)} sub-cuenta ${ride.name}, ${money(balance)}${balance !== 0 ? '' : ' (inactiva)'}`);
    }

    const total = own.reduce((sum, tx) => sum + signedAmountFor(tx, id), 0);
    if (total !== assigned) console.log(`  ⚠ ${id.padEnd(32)} ${money(total - assigned)} en movimientos sin categoría de transporte: no pasan a ninguna sub-cuenta`);

    batch.set(doc(db, 'accounts', id), { balance: 0, hasSubAccount: true, isLedger: deleteField() }, { merge: true });
    writes += 1;
    console.log(`  ✓ ${id.padEnd(32)} vuelve a hasSubAccount (suma ${money(assigned)} entre sus sub-cuentas)`);
    continue;
  }

  const balance = own.reduce((sum, tx) => sum + signedAmountFor(tx, id), 0);
  batch.set(doc(db, 'accounts', id), { balance, isLedger: deleteField() }, { merge: true });
  writes += 1;
  console.log(`  ✓ ${id.padEnd(32)} saldo ${money(balance)} (${own.length} movimiento(s), tenía escrito ${money(account.balance || 0)})`);
}

// movimientos de cuentas que ya no existen: no van a ningún lado, solo se avisa
const orphans = txs.filter((tx) => !accountIds.includes(tx.accountId));
if (orphans.length) console.log(`  ⚠ ${orphans.length} movimiento(s) de cuentas que no existen, se ignoran`);

console.log(`\n${writes} escritura(s). La colección transactions no se toca.`);

if (!apply) {
  console.log('Simulacro: no se escribió nada. Volvé a correr con --apply.');
} else if (writes === 0) {
  console.log('Nada que hacer.');
} else {
  await batch.commit();
  console.log('Listo, escrito en Firestore.');
}

process.exit(0);
