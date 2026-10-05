import { Alert, Platform } from 'react-native';
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

// Tarjetas de crédito ----------------------------------------------------------

// un mes como número corrido (año * 12 + mes), para contar cuotas restando
const monthIndex = (date) => date.getFullYear() * 12 + date.getMonth();

const MONTHS_SHORT = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

// las compras traen Timestamp de firestore, pero una recién escrita puede llegar
// con la fecha todavía sin resolver
const purchaseDate = (value) => {
  const date = value?.toDate ? value.toDate() : value ? new Date(value) : null;
  return date && !Number.isNaN(date.getTime()) ? date : null;
};

// El mes en que se paga la primera cuota de una compra. Es el que queda escrito
// en la compra (firstMonthIndex) y las cuotas se cuentan solo desde ahí. Una
// compra sin mes escrito usa el sugerido. Sin fecha no hay mes
export function firstInstallmentIndex(purchase, card) {
  if (purchase?.firstMonthIndex != null) return purchase.firstMonthIndex;
  return suggestedFirstInstallmentIndex(purchase, card);
}

// El mes que se sugiere al anotar una compra, sacado de la fecha y de los días
// de la tarjeta: lo que se compra hasta el día de facturación entra en el
// estado de cuenta de ese mes, lo de después en el del mes siguiente. Ese
// estado se paga el mismo mes si el día de pago viene después de la facturación
// (factura el 5, paga el 20) o el mes siguiente si viene antes (factura el 20,
// paga el 5). Una tarjeta sin días usa el 1 para los dos. Es solo el valor con
// el que nace la fila en el modal: ahí se puede cambiar
export function suggestedFirstInstallmentIndex(purchase, card) {
  const date = purchaseDate(purchase?.date);
  if (!date) return null;
  const billingDay = card?.billingDay || 1;
  const paymentDay = card?.paymentDay || 1;
  const billedIn = monthIndex(date) + (date.getDate() > billingDay ? 1 : 0);
  return billedIn + (paymentDay > billingDay ? 0 : 1);
}

// el mes que se mira en Gastos, como número corrido
export function currentMonthIndex(monthOffset = 0) {
  return monthIndex(getEffectiveDate(monthOffset));
}

// "nov 2026", para decir cuándo arranca una compra
export function monthIndexLabel(index) {
  if (index == null) return '—';
  return `${MONTHS_SHORT[index % 12]} ${Math.floor(index / 12)}`;
}

// la cuota de una compra que se paga en el mes que se mira: 1 es la primera.
// Fuera de rango (menor que 1 o mayor que las cuotas) es que ese mes no le toca
export function cardInstallment(purchase, card, monthOffset = 0) {
  const first = firstInstallmentIndex(purchase, card);
  if (first == null) return null;
  return monthIndex(getEffectiveDate(monthOffset)) - first + 1;
}

// Las compras de una tarjeta separadas por lo que le toca al mes que se mira:
// las que pagan cuota ese mes y las que todavía no empiezan (una compra recién
// anotada suele caer en el mes siguiente, y si no se mostrara parecería
// perdida). Las ya pagadas enteras no salen. El total es la suma de las cuotas
// del mes: el monto de una compra ya es el valor de su cuota
export function cardMonth({ card, purchases, monthOffset = 0 }) {
  const mine = purchases.filter((p) => p.cardId === card.id);
  const byDate = (a, b) => (purchaseDate(b.date)?.getTime() || 0) - (purchaseDate(a.date)?.getTime() || 0);

  const current = mine
    .map((purchase) => ({ purchase, installment: cardInstallment(purchase, card, monthOffset) }))
    .filter(({ purchase, installment }) => installment >= 1 && installment <= (purchase.installments || 1))
    .sort((a, b) => byDate(a.purchase, b.purchase));

  const upcoming = mine
    .map((purchase) => ({ purchase, installment: cardInstallment(purchase, card, monthOffset) }))
    .filter(({ installment }) => installment != null && installment < 1)
    .sort((a, b) => byDate(a.purchase, b.purchase));

  const total = current.reduce((sum, { purchase }) => sum + (Number(purchase.amount) || 0), 0);

  return { current, upcoming, total };
}
