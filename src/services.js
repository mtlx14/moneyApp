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

// las semanas marcadas de un gasto semanal, y si con eso queda pagado entero
export function updateBillWeeks({ bill, paidWeeks, isPaid }) {
  setDoc(doc(db, 'bills', bill.id), { paidWeeks, isPaid }, { merge: true });
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

// Semilla de la colección, desde data.js. Idempotente: los ids son fijos, así
// que volver a correrla reescribe lo mismo encima.
export function seedCategories(categories) {
  Object.entries(categories).forEach(([id, category], index) => {
    setDoc(doc(db, 'categories', id), { ...category, order: category.order ?? index }, { merge: true });
  });
}

// Tarjetas de crédito -----------------------------------------------------------

// Alta y edición del mismo lado, como los movimientos: sin id es nueva. Los días
// de facturación y de pago son los que ubican cada cuota en su mes
export function saveCard({ card }) {
  const ref = card.id ? doc(db, 'cards', card.id) : doc(collection(db, 'cards'));

  setDoc(
    ref,
    {
      name: card.name.trim(),
      emoji: card.emoji || '💳',
      billingDay: Number(card.billingDay),
      paymentDay: Number(card.paymentDay),
      order: card.order ?? 0,
    },
    { merge: true },
  );

  return ref.id;
}

// la tarjeta se va con sus compras: sin ella no tienen dónde verse
export function deleteCard({ card, purchases = [] }) {
  purchases.filter((p) => p.cardId === card.id).forEach((p) => deleteDoc(doc(db, 'cardPurchases', p.id)));
  deleteDoc(doc(db, 'cards', card.id));
}

// El monto es el valor de la cuota, no el total: es lo que sale en el estado de
// cuenta, ya con el interés. Una compra al contado es una cuota
export function saveCardPurchase({ purchase }) {
  const ref = purchase.id ? doc(db, 'cardPurchases', purchase.id) : doc(collection(db, 'cardPurchases'));

  setDoc(
    ref,
    {
      cardId: purchase.cardId,
      label: (purchase.label || '').trim(),
      amount: Number(purchase.amount),
      installments: Math.max(1, Number(purchase.installments) || 1),
      category: purchase.category || deleteField(),
      date: Timestamp.fromDate(purchase.date instanceof Date ? purchase.date : new Date(purchase.date)),
      // el mes de la primera cuota escrito a mano; sin él se calcula de la fecha
      firstMonthIndex: purchase.firstMonthIndex ?? deleteField(),
    },
    { merge: true },
  );

  return ref.id;
}

export function deleteCardPurchase({ purchase }) {
  deleteDoc(doc(db, 'cardPurchases', purchase.id));
}
