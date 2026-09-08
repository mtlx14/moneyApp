import Home from './pages/Home.js';
import FixedExpenses from './pages/FixedExpenses.js';
import Monthly_summary from './pages/Monthly_summary.js';
import Subscriptions from './pages/Subscriptions.js';
import Matias_accounts from './pages/Matias_accounts.js';
import Aylin_accounts from './pages/Aylin_accounts.js';
import MainMenu from './components/MainMenu.js';
import GradientBackground from './components/GradientBackground.js';
import PageScroller from './components/PageScroller.js';

export default {
  name: 'v2',
  pages: {
    home: Home,
    fixed_expenses: FixedExpenses,
    monthly_summary: Monthly_summary,
    subscriptions: Subscriptions,
    matias_accounts: Matias_accounts,
    aylin_accounts: Aylin_accounts,
  },
  MainMenu,
  GradientBackground,
  // El riel es vertical, así que las páginas se apilan y navegar es scrollear.
  // El orden define la posición de cada una: las cuatro del riel primero, en el
  // mismo orden en que aparecen ahí.
  PageScroller,
  pageOrder: ['home', 'monthly_summary', 'matias_accounts', 'aylin_accounts', 'subscriptions', 'fixed_expenses'],
};
