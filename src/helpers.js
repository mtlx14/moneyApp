import { Alert, Platform } from 'react-native';
import { Timestamp } from 'firebase/firestore';
import { ACCOUNT_TYPE_USER, BILL_CATEGORIES, RIDE_ACCOUNTS, RIDE_CATEGORIES, TRANSFER_PAIR, TRANSFER_TYPES, USER_ACCOUNT_TYPE, txTypes } from '../data.js';

export function getEffectiveDate(monthOffset = 0) {
  const d = new Date();
  d.setDate(1);
  d.setMonth(d.getMonth() + monthOffset);
  return d;
}

// monto de un gasto para el mes que está a targetOffset meses del actual: el mes
// actual usa amount y de ahí en adelante el monto de "mes 2" si está definido
export function amountForMonth(bill, targetOffset = 0) {
  return targetOffset >= 1 && bill.nextAmount ? bill.nextAmount : bill.amount;
}

const MONTH_NAMES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

export function monthName(monthOffset = 0) {
  return MONTH_NAMES[getEffectiveDate(monthOffset).getMonth()];
}

// "Septiembre 2026", para el pie de Inicio: el año importa cuando se mira el
// mes siguiente en diciembre.
export function monthAndYear(monthOffset = 0) {
  const date = getEffectiveDate(monthOffset);
  return `${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`;
}

export function currentInstallment(firstMonth, monthOffset = 0) {
  const now = getEffectiveDate(monthOffset);
  const first = firstMonth.toDate();

  const yearDiff = now.getFullYear() - first.getFullYear();
  const monthDiff = now.getMonth() - first.getMonth();

  return yearDiff * 12 + monthDiff + 1;
}

export function createTimestamp(month, year) {
  const date = new Date(parseInt(year), parseInt(month) - 1, 1);
  return Timestamp.fromDate(date);
}
export function getMonth(timestamp) {
  if (!timestamp) return '';

  const date = timestamp.toDate();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');

  return String(month);
}
export function getYear(timestamp) {
  if (!timestamp) return '';

  const date = timestamp.toDate();
  const year = date.getFullYear().toString();

  return year;
}

export function getNextMonth(monthOffset = 0) {
  const now = getEffectiveDate(monthOffset);
  const nextMonthDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const month = (nextMonthDate.getMonth() + 1).toString().padStart(2, '0');
  return month;
}
export function getYearOfNextMonth(monthOffset = 0) {
  const now = getEffectiveDate(monthOffset);
  const nextMonthDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return nextMonthDate.getFullYear().toString();
}

// Pregunta antes de borrar, con el diálogo de cada plataforma: en web el del
// navegador, en nativo el Alert. Mismo camino que usan los modales de gastos.
export function confirmDelete({ title, message, onConfirm, onCancel }) {
  if (Platform.OS === 'web') {
    if (window.confirm(message)) onConfirm();
    else onCancel?.();
    return;
  }

  Alert.alert(title, message, [
    { text: 'Cancelar', style: 'cancel', onPress: () => onCancel?.() },
    { text: 'Eliminar', style: 'destructive', onPress: onConfirm },
  ]);
}

// clave de mes de una fecha, para agrupar y filtrar transacciones sin rangos
export function monthKeyOf(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

// el saldo inicial y los ingresos suman; el resto (gastos, ajustes, transferencias) resta
export function addsToBalance(tx) {
  return tx?.type === 'income' || tx?.type === 'initial';
}

// mueve plata de una cuenta a otra: la propia o, entre usuarios, la del otro
export function isTransfer(tx) {
  return TRANSFER_TYPES.includes(tx?.type);
}

// el nombre del tipo como se lee en el modal: la transferencia entre usuarios
// dice a quién va, el resto usa la etiqueta de txTypes
export function txTypeLabel(type, otherUserLabel) {
  if (type === 'user_transfer' && otherUserLabel) return `Tr. a ${otherUserLabel}`;
  return txTypes[type]?.label || type;
}

// el usuario dueño de un tipo de cuenta, y el otro
export function userOfAccountType(accountType) {
  return ACCOUNT_TYPE_USER[accountType];
}

export function otherAccountType(accountType) {
  return accountType === 'm_account' ? 'a_account' : accountType === 'a_account' ? 'm_account' : null;
}

// el monto de una transacción con su signo
export function signedAmount(tx) {
  return addsToBalance(tx) ? tx.amount : -tx.amount;
}

// lo que aporta una transacción a una cuenta en particular: una transferencia
// resta en la de origen y suma en la de destino, el resto solo toca la suya
export function signedAmountFor(tx, accountId) {
  if (isTransfer(tx) && tx.toAccountId === accountId) return tx.amount;
  return signedAmount(tx);
}

// saldo que aportan un conjunto de transacciones
export function sumTransactions(transactions) {
  return transactions.reduce((total, tx) => total + signedAmount(tx), 0);
}

// Cuentas de las apps de transporte -------------------------------------------

// Por pagar y Currently no llevan cualquier movimiento: solo ingresos y solo de
// las categorías de RIDE_CATEGORIES (antes eran sub-cuentas). Ver data.js.
export function isRideAccount(account) {
  return RIDE_ACCOUNTS.includes(account?.id);
}

// las categorías de transporte que existen hoy en la base, en el orden de
// RIDE_CATEGORIES. Devuelve [id, categoría], con el emoji de data.js sumado a la
// categoría: es lo que muestra la fila del listado de cuentas
export function rideCategories(categories) {
  return RIDE_CATEGORIES.map(({ label, emoji }) => {
    const found = Object.entries(categories).find(([, c]) => c.label === label);
    return found && [found[0], { ...found[1], emoji }];
  }).filter(Boolean);
}

// lo que puso cada app dentro de una cuenta de transporte: la suma de sus
// movimientos por categoría. Solo lo abren Por pagar y Currently —el resto de
// las cuentas no muestra desglose ninguno, aunque tenga un movimiento de esas
// categorías—, y las que no tienen ninguno quedan fuera, así que una cuenta
// vacía tampoco muestra nada
export function rideBreakdown({ account, transactions, categories }) {
  if (!isRideAccount(account)) return [];

  return rideCategories(categories)
    .map(([id, category]) => {
      const rows = transactions.filter((tx) => tx.accountId === account.id && tx.category === id);

      return {
        id,
        category,
        total: rows.reduce((sum, tx) => sum + signedAmountFor(tx, account.id), 0),
        // el más nuevo, que es el que abre la fila al tocarla
        lastTx: [...rows].sort((a, b) => (b.date?.seconds || 0) - (a.date?.seconds || 0))[0],
      };
    })
    .filter((row) => row.total !== 0);
}

// Avisos entre los dos ---------------------------------------------------------

// si el otro hizo cambios que este usuario todavía no aceptó: es lo que enciende
// el aviso verde de Inicio. Se lee del documento, sin estado de por medio, así
// que vale ya en el primer render
export function hasPendingChanges(appMeta, userName) {
  if (userName === 'matias') return !!(appMeta?.mOkDate && appMeta?.aChangesDate && appMeta.mOkDate < appMeta.aChangesDate);
  return !!(appMeta?.aOkDate && appMeta?.mChangesDate && appMeta.aOkDate < appMeta.mChangesDate);
}

// Categorías --------------------------------------------------------------------

// Las categorías se leen en alfabético y con Otros al final: es el cajón de
// sastre, no una categoría más. Va por etiqueta, como el resto de los mapas: si
// se renombra, queda ordenada como cualquier otra
export function byLabelOtrosLast(a, b) {
  const isOtros = (label) => Number((label || '').trim().toLowerCase() === 'otros');
  return isOtros(a.label) - isOtros(b.label) || a.label.localeCompare(b.label, 'es');
}

// Gastos del resumen del mes ---------------------------------------------------

// la categoría con la que nace el movimiento de un gasto pagado, buscada por
// etiqueta en las que hay hoy en la base. Ver BILL_CATEGORIES en data.js
export function billCategoryId(bill, categories) {
  const label = BILL_CATEGORIES[bill?.type];
  if (!label) return undefined;
  return Object.entries(categories).find(([, c]) => c.label === label)?.[0];
}

// La cuenta desde la que se paga: siempre una del usuario que está usando la
// app —Matías nunca anota en las de Aylin ni al revés—, y de esas la cuenta
// corriente. Si no la tuviera, cualquiera de sus cuentas de ledger que no sea de
// transporte. Es solo el valor con el que abre el modal, ahí se puede cambiar
export function defaultTxAccount(accounts, userName) {
  const type = USER_ACCOUNT_TYPE[userName];
  const mine = accounts.filter((a) => a.type === type && a.isLedger && !isRideAccount(a));
  return mine.find((a) => a.name === TRANSFER_PAIR[0]) || mine[0];
}
