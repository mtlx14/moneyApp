// Arreglo de una sola vez: 'Saldo inicial', 'Transferencia' y 'Ajuste' no son
// categorías, son tipos de movimiento. Se borran de la colección 'categories'
// y se les saca la categoría a los movimientos de esos tipos que todavía la
// tengan escrita.
//
//   node scripts/drop-type-categories.mjs          (simulacro, no escribe)
//   node scripts/drop-type-categories.mjs --apply  (escribe)
//
// Es idempotente: si los documentos ya no están y ningún movimiento de esos
// tipos tiene categoría, no hace nada.

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

// los ids de la semilla vieja. La lista es fija a propósito: una categoría que
// el usuario haya creado a mano no se toca aunque se llame parecido
const CATEGORY_IDS = ['cat_saldo_inicial', 'cat_transferencia', 'cat_ajuste'];
const TYPES_WITHOUT_CATEGORY = ['initial', 'transfer', 'adjustment'];

const apply = process.argv.includes('--apply');

const db = getFirestore(initializeApp(firebaseConfig));
const batch = writeBatch(db);
let changes = 0;

const categoriesSnap = await getDocs(collection(db, 'categories'));
for (const d of categoriesSnap.docs) {
  if (!CATEGORY_IDS.includes(d.id)) continue;
  batch.delete(doc(db, 'categories', d.id));
  changes += 1;
  console.log(`  ✗ categoría ${d.id}`);
}

const txSnap = await getDocs(collection(db, 'transactions'));
for (const d of txSnap.docs) {
  const tx = d.data();
  // el tipo manda: si no lleva categoría, se la sacamos sea cual sea
  const stale = TYPES_WITHOUT_CATEGORY.includes(tx.type) ? tx.category !== undefined : CATEGORY_IDS.includes(tx.category);
  if (!stale) continue;

  batch.set(doc(db, 'transactions', d.id), { category: deleteField() }, { merge: true });
  changes += 1;
  console.log(`  ✓ ${d.id.padEnd(24)} ${(tx.type || '').padEnd(12)} ${tx.category}`);
}

if (!changes) console.log('Nada que arreglar.');
else if (apply) {
  await batch.commit();
  console.log(`\n${changes} cambios escritos.`);
} else {
  console.log(`\n${changes} cambios pendientes. Correr con --apply para escribirlos.`);
}

process.exit(0);
