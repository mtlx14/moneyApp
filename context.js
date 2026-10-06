import { createContext, use, useContext, useEffect, useMemo, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import db from './conection';
import { useAppStorage } from './appStorageProvider';
import { amountForMonth, billAmountForMonth, billToPay, cardMonth, getEffectiveDate } from './src/helpers';
import { defaultCategories } from './data.js';
import { seedCategories } from './src/services.js';

const DataContext = createContext(null);

const roundUpToThousand = (value) => Math.ceil(value / 1000) * 1000;

const shouldPayNextMonth = (bill, monthOffset = 0) => {
  if (!bill.inMonths || !bill.firstMonth) {
    return true;
  }

  const startDate = bill.firstMonth.seconds ? new Date(bill.firstMonth.seconds * 1000) : new Date(bill.firstMonth);

  const today = getEffectiveDate(monthOffset);
  const nextMonthDate = new Date(today.getFullYear(), today.getMonth() + 1, 1);

  const yearDiff = nextMonthDate.getFullYear() - startDate.getFullYear();
  const monthDiff = nextMonthDate.getMonth() - startDate.getMonth();

  const cuotaNumero = yearDiff * 12 + monthDiff + 1;

  return cuotaNumero > 0 && cuotaNumero <= bill.inMonths;
};
export const DataProvider = ({ children }) => {
  const { monthOffset } = useAppStorage();
  const [accounts, setAccounts] = useState([]);
  const [bills, setBills] = useState([]);
  const [appMeta, setAppMeta] = useState([]);
  const [transactions, setTransactions] = useState([]);
  // las tarjetas de crédito y sus compras
  const [cards, setCards] = useState([]);
  const [cardPurchases, setCardPurchases] = useState([]);
  // mapa id -> categoría. Arranca con las de código y lo pisa la colección
  const [categories, setCategories] = useState(defaultCategories);

  useEffect(() => {
    const unsubAccounts = onSnapshot(collection(db, 'accounts'), (snap) => {
      setAccounts(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });

    const unsubBills = onSnapshot(collection(db, 'bills'), (snap) => {
      setBills(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });

    const unsubAppMeta = onSnapshot(collection(db, 'appMeta'), (snap) => {
      setAppMeta(snap.docs.map((d) => ({ id: d.id, ...d.data() }))[0]);
    });

    // los movimientos ya no mueven saldos: quedan solo para que la página de
    // categorías sepa cuáles están en uso
    const unsubTransactions = onSnapshot(collection(db, 'transactions'), (snap) => {
      setTransactions(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });

    const unsubCards = onSnapshot(collection(db, 'cards'), (snap) => {
      setCards(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });

    const unsubCardPurchases = onSnapshot(collection(db, 'cardPurchases'), (snap) => {
      setCardPurchases(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });

    // Las categorías vivían en código y ahora se editan desde la app. La primera
    // vez que la colección aparece vacía se escribe la semilla de data.js: los
    // ids son fijos, así que si los dos teléfonos lo hacen a la vez escriben lo
    // mismo. Mientras tanto se sigue mostrando la semilla, no una lista vacía.
    const unsubCategories = onSnapshot(collection(db, 'categories'), (snap) => {
      if (snap.empty) {
        setCategories(defaultCategories);
        seedCategories(defaultCategories);
        return;
      }
      setCategories(Object.fromEntries(snap.docs.map((d) => [d.id, { id: d.id, ...d.data() }])));
    });

    return () => {
      unsubAccounts();
      unsubBills();
      unsubAppMeta();
      unsubTransactions();
      unsubCategories();
      unsubCards();
      unsubCardPurchases();
    };
  }, []);

  // el saldo de una cuenta es el número escrito a mano con el teclado
  const balanceOf = (account) => account?.balance || 0;

  // saldos por dueño: las cuentas propias más lo que sumen sus sub-cuentas,
  // descontando las marcadas como isNegative (guardan en positivo lo que se debe)
  const accountsByType = (type, excludeIds = []) => {
    const map = {};

    accounts
      .filter((a) => a.type === type && !a.hasSubAccount && !excludeIds.includes(a.id))
      .forEach((a) => {
        map[a.id] = {
          id: a.id,
          name: a.name,
          balance: balanceOf(a),
        };
      });
    accounts
      .filter((a) => a.type === 'sub_account')
      .forEach((a) => {
        const parent = accounts.find((account) => account.id === a.forAccount);
        if (!parent || parent.type !== type) return;

        if (!map[a.forAccount]) {
          map[a.forAccount] = {
            id: a.forAccount,
            name: parent.name,
            balance: 0,
          };
        }
        map[a.forAccount].balance += balanceOf(a);
      });

    const total = Object.values(map).reduce((sum, acc) => sum + (acc.balance || 0), 0) - accounts.filter((a) => a.type === type && a.isNegative && !a.hasSubAccount && !excludeIds.includes(a.id)).reduce((sum, acc) => sum + balanceOf(acc), 0) * 2;

    return { map, total };
  };

  const balances = useMemo(() => {
    // saldo ya resuelto de TODAS las cuentas, para que las páginas no vuelvan a
    // leer account.balance a mano
    const byAccount = {};
    accounts.forEach((a) => {
      byAccount[a.id] = balanceOf(a);
    });

    const { map: m_account, total: matiasTotal } = accountsByType('m_account');
    // account_aylin quedó reemplazada por sus cuentas nuevas y el sueldo de home es solo estimado
    const { map: a_account, total: aylinTotal } = accountsByType('a_account', ['account_aylin', 'account_aylin_salary']);

    const billsSub = bills.filter((b) => b.type === 'sub');
    const subscriptions = {
      total: billsSub.reduce((a, b) => a + b.amount, 0),
      toPay: 0,
    };
    subscriptions.toPay = subscriptions.total - billsSub.filter((b) => b.isPaid).reduce((a, b) => a + b.amount, 0);

    // Las tarjetas de crédito cuentan como un gasto más: lo que suman las cuotas
    // del mes, y se descuenta de lo por pagar cuando se marca pagada en Gastos.
    // El mes siguiente se calcula igual, corrido un mes: entran las compras que
    // empiezan y salen las que terminan. En Inicio van redondeadas a miles, siempre
    // hacia arriba; adentro de la tarjeta se ve el monto exacto
    const cardTotals = cards.map((card) => ({
      id: card.id,
      label: card.name,
      emoji: card.emoji || '💳',
      isPaid: !!card.isPaid,
      amount: roundUpToThousand(cardMonth({ card, purchases: cardPurchases, monthOffset }).total),
    }));

    const billsBalances = {
      toPay: bills.filter((b) => b.type === 'fixed' || b.type === 'planned').reduce((a, b) => a + billToPay(b, monthOffset), 0) + subscriptions.toPay + cardTotals.filter((c) => !c.isPaid).reduce((a, c) => a + c.amount, 0),
      subscriptions,
    };
    const totalAfterPayments = matiasTotal + aylinTotal - billsBalances.toPay;
    const salaries = (byAccount['account_aylin_salary'] || 0) + (byAccount['account_matias_salary'] || 0);

    // Proyección del mes que está `ahead` meses después del que se mira: parte de
    // lo que queda del mes anterior, le suma los sueldos y le descuenta los fijos,
    // las suscripciones, los planeados que caen ese mes y las cuotas de las
    // tarjetas de ese mes
    const projectMonth = (ahead, startBalance) => {
      const target = monthOffset + ahead;
      const beforePayments = startBalance + salaries;
      // los semanales suman una vez por cada semana de ese mes
      const fixedTotal = bills.filter((b) => b.type === 'fixed' || b.type === 'sub').reduce((a, b) => a + billAmountForMonth(b, target), 0);
      // shouldPayNextMonth mira el mes que sigue al que recibe
      const planned = bills.filter((b) => b.type === 'planned' && shouldPayNextMonth(b, target - 1));
      const monthCards = cards.map((card) => ({
        id: card.id,
        label: card.name,
        emoji: card.emoji || '💳',
        amount: roundUpToThousand(cardMonth({ card, purchases: cardPurchases, monthOffset: target }).total),
      }));
      const afterPayments = beforePayments - fixedTotal - planned.reduce((a, b) => a + amountForMonth(b, target), 0) - monthCards.reduce((a, c) => a + c.amount, 0);

      return { startBalance, beforePayments, fixedTotal, bills: planned, cards: monthCards, afterPayments };
    };

    // el mes siguiente parte de lo que queda este mes, y el subsiguiente de lo que
    // queda el siguiente
    const nextMonth = projectMonth(1, totalAfterPayments);
    const monthAfter = projectMonth(2, nextMonth.afterPayments);

    return { byAccount, m_account, a_account, matiasTotal, aylinTotal, billsBalances, totalAfterPayments, nextMonth, monthAfter };
  }, [accounts, bills, appMeta, cards, cardPurchases, monthOffset]);
  return <DataContext.Provider value={{ accounts, bills, appMeta, transactions, balances, categories, cards, cardPurchases }}>{children}</DataContext.Provider>;
};

export const useData = () => useContext(DataContext);
