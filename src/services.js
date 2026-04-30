import { setDoc, doc, deleteDoc, serverTimestamp, arrayUnion } from 'firebase/firestore';
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
