import Home from './pages/Home.js';
import FixedExpenses from './pages/FixedExpenses.js';
import Monthly_summary from './pages/Monthly_summary.js';
import Subscriptions from './pages/Subscriptions.js';
import Matias_accounts from './pages/Matias_accounts.js';
import Aylin_accounts from './pages/Aylin_accounts.js';
import MainMenu from './components/MainMenu.js';
import GradientBackground from './components/GradientBackground.js';
import { FadeInDown, FadeInUp, FadeOutDown, FadeOutUp } from 'react-native-reanimated';

// Los presets son los únicos que animan acá: las funciones custom, aunque
// lleven la directiva 'worklet', reanimated las ignora sin avisar.
// Del recorrido solo se puede tocar el de entrada, con withInitialValues; el
// de salida tiene su -25 escrito en la animación del preset.
const TRAVEL_IN = 100;
const DURATION_OUT = 100;
const DURATION_IN = 100;

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
  // El menú es una barra vertical, así que la página acompaña el movimiento:
  // direction 1 = el destino está más abajo en el riel, entra desde abajo.
  pageAnimations: (direction) => ({
    en: (direction === 1 ? FadeInDown : FadeInUp).duration(DURATION_IN).delay(DURATION_OUT * 0.4).withInitialValues({ transform: [{ translateY: direction === 1 ? TRAVEL_IN : -TRAVEL_IN }] }),
    ex: (direction === 1 ? FadeOutUp : FadeOutDown).duration(DURATION_OUT),
  }),
};
