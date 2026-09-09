// Migración de una sola vez: las sub-cuentas de transporte (Uber, Didi, Cabify
// dentro de "Por pagar" y "Currently") dejan de existir. Lo que había adentro
// pasa a ser un movimiento con categoría dentro de la cuenta grande, así que:
//
//   - las dos cuentas grandes quedan isLedger (su saldo sale de sus
//     transacciones) y arrancan en cero,
//   - las seis sub-cuentas se borran, junto con las transacciones que tuvieran,
//   - se crean las categorías de transporte que falten (ingreso).
//
//   node scripts/drop-sub-accounts.mjs          (simulacro, no escribe)
//   node scripts/drop-sub-accounts.mjs --apply  (escribe)
//
// Es idempotente: lo que ya está hecho se saltea. Antes de borrar imprime el
// contenido de cada documento, que es el único respaldo que queda.

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

// las mismas de RIDE_ACCOUNTS y RIDE_CATEGORIES en data.js
const RIDE_ACCOUNTS = ['m_account_to_be_paid', 'm_account_currently'];
const RIDE_CATEGORIES = [
  { id: 'cat_uber', label: 'Uber', icon: 'local_taxi', color: '#5B7D8C', kind: 'income', order: 9 },
  { id: 'cat_didi', label: 'Didi', icon: 'local_taxi', color: '#D08C3E', kind: 'income', order: 10 },
  { id: 'cat_cabify', label: 'Cabify', icon: 'local_taxi', color: '#7A6FA8', kind: 'income', order: 11 },
];

const apply = process.argv.includes('--apply');

const db = getFirestore(initializeApp(firebaseConfig));
const accountsSnap = await getDocs(collection(db, 'accounts'));
const txSnap = await getDocs(collection(db, 'transactions'));
const categoriesSnap = await getDocs(collection(db, 'categories'));

const batch = writeBatch(db);
let writes = 0;

// 1. las cuentas grandes pasan al ledger y arrancan en cero
for (const id of RIDE_ACCOUNTS) {
  const found = accountsSnap.docs.find((d) => d.id === id);
  if (!found) {
    console.log(`  ✗ ${id.padEnd(32)} no existe, se saltea`);
    continue;
  }
  const data = found.data();
  if (data.isLedger && !data.hasSubAccount) {
    console.log(`  · ${id.padEnd(32)} ya migrada, se saltea`);
    continue;
  }
  batch.set(doc(db, 'accounts', id), { isLedger: true, balance: 0, hasSubAccount: deleteField() }, { merge: true });
  writes += 1;
  console.log(`  ✓ ${id.padEnd(32)} isLedger, saldo 0 (tenía $${(data.balance || 0).toLocaleString('es-CL')})`);
}

// 2. las sub-cuentas y sus movimientos se borran
const subAccounts = accountsSnap.docs.filter((d) => d.data().type === 'sub_account');
for (const sub of subAccounts) {
  console.log(`  ✗ ${sub.id.padEnd(32)} se borra → ${JSON.stringify(sub.data())}`);
  batch.delete(doc(db, 'accounts', sub.id));
  writes += 1;
}
const subIds = subAccounts.map((d) => d.id);
for (const tx of txSnap.docs.filter((d) => subIds.includes(d.data().accountId) || subIds.includes(d.data().toAccountId))) {
  console.log(`  ✗ tx ${tx.id.padEnd(28)} se borra → ${JSON.stringify(tx.data())}`);
  batch.delete(doc(db, 'transactions', tx.id));
  writes += 1;
}

// 3. las categorías de transporte que falten. Se busca por etiqueta, que es como
// las mira la app: si Uber ya existe con otro id, no se duplica
for (const category of RIDE_CATEGORIES) {
  const { id, ...data } = category;
  if (categoriesSnap.docs.some((d) => d.data().label === data.label)) {
    console.log(`  · categoría ${data.label.padEnd(22)} ya existe, se saltea`);
    continue;
  }
  batch.set(doc(db, 'categories', id), data, { merge: true });
  writes += 1;
  console.log(`  ✓ categoría ${data.label.padEnd(22)} creada`);
}

console.log(`\n${writes} escritura(s).`);

if (!apply) {
  console.log('Simulacro: no se escribió nada. Volvé a correr con --apply.');
} else if (writes === 0) {
  console.log('Nada que hacer.');
} else {
  await batch.commit();
  console.log('Listo, escrito en Firestore.');
}

process.exit(0);
