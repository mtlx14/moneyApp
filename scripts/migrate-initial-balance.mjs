// Migración de una sola vez: pasa el saldo escrito a mano de cada cuenta a una
// transacción "Saldo inicial" y marca la cuenta con isLedger, para que a partir
// de acá su saldo salga de sumar sus transacciones.
//
//   node scripts/migrate-initial-balance.mjs          (simulacro, no escribe)
//   node scripts/migrate-initial-balance.mjs --apply  (escribe)
//
// Es idempotente: una cuenta que ya tiene isLedger se saltea. No borra ni pisa
// `balance`, queda como respaldo para poder volver atrás.

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, getDocs, serverTimestamp, Timestamp, writeBatch } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyAEoxLLMqVf7IE1wjl9PR3j5eSiadkMbzY',
  authDomain: 'moneyapp-452ab.firebaseapp.com',
  projectId: 'moneyapp-452ab',
  storageBucket: 'moneyapp-452ab.firebasestorage.app',
  messagingSenderId: '834278591547',
  appId: '1:834278591547:web:005a3b9dae24f29b0e201e',
};

// Las cuentas que pasan al modelo de transacciones. Fuera quedan, a propósito:
// los contenedores m_account_to_be_paid y m_account_currently (su saldo ya es la
// suma de sus subcuentas), m_accouunt (Bencina, la cuenta de deuda), los dos
// sueldos (son una estimación que se edita desde Inicio) y las legacy
// account_matias / account_aylin.
const LEDGER_ACCOUNTS = [
  'm_account_cta_corriente',
  'm_account_cash',
  'm_sub_account_uber_to_be_paid',
  'm_sub_account_uber_currently',
  'm_sub_account_cabify_to_be_paid',
  'm_sub_account_cabify_currently',
  'm_sub_account_didi_to_be_paid',
  'm_sub_account_didi_currently',
  'account_aylin_corriente',
  'account_aylin_efectivo',
  'account_aylin_por_pagar',
];

const monthKeyOf = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

const apply = process.argv.includes('--apply');

const db = getFirestore(initializeApp(firebaseConfig));
const snap = await getDocs(collection(db, 'accounts'));
const accounts = Object.fromEntries(snap.docs.map((d) => [d.id, d.data()]));

const now = new Date();
const batch = writeBatch(db);
let marked = 0;
let created = 0;

for (const id of LEDGER_ACCOUNTS) {
  const account = accounts[id];

  if (!account) {
    console.log(`  ✗ ${id.padEnd(32)} no existe en Firestore, se saltea`);
    continue;
  }
  if (account.isLedger) {
    console.log(`  · ${id.padEnd(32)} ya migrada, se saltea`);
    continue;
  }

  const balance = account.balance || 0;
  batch.set(doc(db, 'accounts', id), { isLedger: true }, { merge: true });
  marked += 1;

  // una cuenta ledger sin transacciones ya suma 0: una de monto 0 sería ruido
  if (balance !== 0) {
    batch.set(doc(collection(db, 'transactions')), {
      accountId: id,
      // tipo propio: suma como un ingreso pero no es uno, y no lleva categoría
      type: 'initial',
      amount: balance,
      date: Timestamp.fromDate(now),
      monthKey: monthKeyOf(now),
      label: 'Saldo inicial',
      emoji: '🏁',
      user: 'matias',
      createdAt: serverTimestamp(),
    });
    created += 1;
    console.log(`  ✓ ${id.padEnd(32)} isLedger + saldo inicial $${balance.toLocaleString('es-CL')}`);
  } else {
    console.log(`  ✓ ${id.padEnd(32)} isLedger, sin transacción (saldo 0)`);
  }
}

console.log(`\n${marked} cuenta(s) a marcar, ${created} transacción(es) a crear.`);

if (!apply) {
  console.log('Simulacro: no se escribió nada. Volvé a correr con --apply.');
} else if (marked === 0) {
  console.log('Nada que hacer.');
} else {
  await batch.commit();
  console.log('Listo, escrito en Firestore.');
}

process.exit(0);
