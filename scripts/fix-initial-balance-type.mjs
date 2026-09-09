// Arreglo de una sola vez: los saldos iniciales que creó migrate-initial-balance
// quedaron con type 'income' y category 'cat_saldo_inicial'. Pasan a type
// 'initial' y se les saca la categoría, que no corresponde a estos movimientos.
//
//   node scripts/fix-initial-balance-type.mjs          (simulacro, no escribe)
//   node scripts/fix-initial-balance-type.mjs --apply  (escribe)
//
// Es idempotente: una transacción que ya está en 'initial' y sin categoría se
// saltea. El saldo no cambia: 'initial' suma igual que 'income'.

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, deleteField, doc, getDocs, writeBatch } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyAEoxLLMqVf7IE1wjl9PR3j5eSiadkMbzY',
  authDomain: 'moneyapp-452ab.firebaseapp.com',
  projectId: 'moneyapp-452ab',
  storageBucket: 'moneyapp-452ab.firebasestorage.app',
  messagingSenderId: '834278591547',
  appId: '1:834278591547:web:005a3b9dae24f29b0e201e',
};

const apply = process.argv.includes('--apply');

const db = getFirestore(initializeApp(firebaseConfig));
const snap = await getDocs(collection(db, 'transactions'));

const batch = writeBatch(db);
let fixed = 0;

for (const d of snap.docs) {
  const tx = d.data();
  // el saldo inicial se reconoce por su categoría vieja o por su etiqueta
  const isInitial = tx.category === 'cat_saldo_inicial' || tx.label === 'Saldo inicial';
  if (!isInitial) continue;
  if (tx.type === 'initial' && tx.category === undefined) continue;

  batch.set(doc(db, 'transactions', d.id), { type: 'initial', category: deleteField() }, { merge: true });
  fixed += 1;
  console.log(`  ✓ ${d.id.padEnd(24)} ${tx.accountId?.padEnd(32) || ''} $${Number(tx.amount).toLocaleString('es-CL')}`);
}

console.log(`\n${fixed} transacción(es) a corregir.`);

if (!apply) {
  console.log('Simulacro: no se escribió nada. Volvé a correr con --apply.');
} else if (fixed === 0) {
  console.log('Nada que hacer.');
} else {
  await batch.commit();
  console.log('Listo, escrito en Firestore.');
}

process.exit(0);
