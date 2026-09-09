import { setDoc, doc, deleteDoc, serverTimestamp, arrayUnion, deleteField, collection, Timestamp } from 'firebase/firestore';
import db from '../conection.js';

export function updateAccountBalance({ account, balance }) {
  setDoc(
    doc(db, 'accounts', account),
    {
      balance: balance,
    },
    {
      merge: true,
    },
  );
}

export function updateSubAccount({ account, balance, isActive }) {
  setDoc(
    doc(db, 'accounts', account),
    {
      balance: balance,
      isActive: isActive,
    },
    {
      merge: true,
    },
  );
}

export function updateBill({ bill }) {
  if (!('id' in bill)) {
    bill.id = `${bill.type === 'sub' ? 'sub' : 'bill'}_${bill.label.toLowerCase().replace(' ', '_')}`;
  }
  setDoc(
    doc(db, 'bills', bill.id),
    {
      ...bill,
      // nextAmount en null significa "sacar el monto de mes 2" del documento,
      // con merge: true los campos ausentes no se borran solos
      ...('nextAmount' in bill && bill.nextAmount == null ? { nextAmount: deleteField() } : {}),
    },
    {
      merge: true,
    },
  );
}

export function deleteBill({ bill }) {
  deleteDoc(doc(db, 'bills', bill.id));
}

export function okChanges({ user }) {
  const fieldOk = user.name === 'matias' ? 'mOkDate' : 'aOkDate';
  const changeField = user.name === 'matias' ? 'aChanges' : 'mChanges';

  setDoc(
    doc(db, 'appMeta', 'changes'),
    {
      [fieldOk]: serverTimestamp(),
      [changeField]: [],
    },
    {
      merge: true,
    },
  );
}

export function updateChanges({ user, change }) {
  console.log(user, change);
  const fieldName = user === 'matias' ? 'mChanges' : 'aChanges';
  const dateName = user === 'matias' ? 'mChangesDate' : 'aChangesDate';

  setDoc(
    doc(db, 'appMeta', 'changes'),
    {
      [fieldName]: arrayUnion(change),
      [dateName]: serverTimestamp(),
    },
    {
      merge: true,
    },
  );
}

// Categorías ------------------------------------------------------------------

// El id se arma con la etiqueta la primera vez y después no se toca: las
// transacciones guardan la clave, así que renombrar una categoría no puede
// mover sus movimientos a otra.
export function saveCategory({ category }) {
  const slug = category.label
    .trim()
    .toLowerCase()
    // los acentos se sacan antes de filtrar, si no 'categoría' queda 'categor_a'
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '');
  const id = category.id || `cat_${slug || 'nueva'}_${Date.now().toString(36)}`;

  setDoc(
    doc(db, 'categories', id),
    {
      label: category.label.trim(),
      icon: category.icon,
      color: category.color,
      kind: category.kind || 'expense',
      order: category.order ?? 0,
    },
    { merge: true },
  );

  return id;
}

export function deleteCategory({ category }) {
  deleteDoc(doc(db, 'categories', category.id));
}

export function deleteTransaction({ tx }) {
  deleteDoc(doc(db, 'transactions', tx.id));
}

// Semilla de la colección, desde data.js. Idempotente: los ids son fijos, así
// que volver a correrla reescribe lo mismo encima.
export function seedCategories(categories) {
  Object.entries(categories).forEach(([id, category], index) => {
    setDoc(doc(db, 'categories', id), { ...category, order: category.order ?? index }, { merge: true });
  });
}

// Movimientos -----------------------------------------------------------------

// Alta y edición del mismo lado: un movimiento sin id es nuevo y Firestore le
// pone uno. La fecha viaja como Date y se guarda como Timestamp, que es lo que
// leen el contexto y el historial.
export function saveTransaction({ tx }) {
  const ref = tx.id ? doc(db, 'transactions', tx.id) : doc(collection(db, 'transactions'));

  setDoc(
    ref,
    {
      accountId: tx.accountId,
      type: tx.type,
      amount: Number(tx.amount),
      label: (tx.label || '').trim(),
      // los tipos que no llevan categoría la borran del documento en vez de
      // dejarla escrita de una edición anterior
      category: tx.category || deleteField(),
      // solo las transferencias tienen destino; en el resto se borra
      toAccountId: tx.type === 'transfer' && tx.toAccountId ? tx.toAccountId : deleteField(),
      date: Timestamp.fromDate(tx.date instanceof Date ? tx.date : new Date(tx.date)),
    },
    { merge: true },
  );

  return ref.id;
}
