import { Timestamp } from 'firebase/firestore';

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

// clave de mes de una fecha, para agrupar y filtrar transacciones sin rangos
export function monthKeyOf(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

// saldo que aportan un conjunto de transacciones: los ingresos suman, los gastos restan
export function sumTransactions(transactions) {
  return transactions.reduce((total, tx) => total + (tx.type === 'income' ? tx.amount : -tx.amount), 0);
}
