import { createContext, use, useContext, useEffect, useMemo, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import db from './conection';
import { useAppStorage } from './appStorageProvider';
import { amountForMonth, getEffectiveDate } from './src/helpers';

const DataContext = createContext(null);

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

    // la colección entera: hoy son unos pocos docs y el saldo de una cuenta es
    // la suma de TODAS sus transacciones, no solo las del mes que se mira
    const unsubTransactions = onSnapshot(collection(db, 'transactions'), (snap) => {
      setTransactions(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });

    return () => {
      unsubAccounts();
      unsubBills();
      unsubAppMeta();
      unsubTransactions();
    };
  }, []);

  // saldo aportado por las transacciones de cada cuenta, ya con signo
  const txByAccount = useMemo(() => {
    const map = {};
    transactions.forEach((tx) => {
      map[tx.accountId] = (map[tx.accountId] || 0) + (tx.type === 'income' ? tx.amount : -tx.amount);
    });
    return map;
  }, [transactions]);

  // única puerta de entrada al saldo de una cuenta. Las cuentas con isLedger lo
  // sacan de sus transacciones; las que quedaron fuera de la migración (los
  // contenedores, Bencina, los sueldos) siguen con el número escrito a mano
  const balanceOf = (account) => (account?.isLedger ? txByAccount[account.id] || 0 : account?.balance || 0);

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

    const billsBalances = {
      toPay: bills.filter((b) => (b.type === 'fixed' || b.type === 'planned') && !b.isPaid).reduce((a, b) => a + b.amount, 0) + subscriptions.toPay,
      subscriptions,
    };
    const totalAfterPayments = matiasTotal + aylinTotal - billsBalances.toPay;
    const nextMonth = {};

    const salaries = (byAccount['account_aylin_salary'] || 0) + (byAccount['account_matias_salary'] || 0);

    nextMonth.beforePayments = totalAfterPayments + salaries;

    nextMonth.bills = bills.filter((b) => {
      if (b.type !== 'planned') return false;
      return shouldPayNextMonth(b, monthOffset);
    });
    nextMonth.afterPayments =
      nextMonth.beforePayments - nextMonth.bills.reduce((a, b) => a + amountForMonth(b, monthOffset + 1), 0) - bills.filter((b) => b.type === 'fixed' || b.type === 'sub').reduce((a, b) => a + amountForMonth(b, monthOffset + 1), 0);

    return { byAccount, m_account, a_account, matiasTotal, aylinTotal, billsBalances, totalAfterPayments, nextMonth };
  }, [accounts, bills, appMeta, transactions, monthOffset]);
  return <DataContext.Provider value={{ accounts, bills, appMeta, transactions, balances }}>{children}</DataContext.Provider>;
};

export const useData = () => useContext(DataContext);
