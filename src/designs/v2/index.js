import Home from './pages/Home.js';
import FixedExpenses from './pages/FixedExpenses.js';
import Monthly_summary from './pages/Monthly_summary.js';
import Subscriptions from './pages/Subscriptions.js';
import Matias_accounts from './pages/Matias_accounts.js';
import Aylin_accounts from './pages/Aylin_accounts.js';
import MainMenu from './components/MainMenu.js';
import GradientBackground from './components/GradientBackground.js';
import PageSlider from './components/PageSlider.js';

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
  // El riel es vertical, así que las páginas se desplazan como una tira: en vez
  // de una animación de entrada y otra de salida, PageSlider mueve las dos con
  // un mismo valor.
  PageSlider,
};
