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
//
// Entrada y salida usan la misma configuración. El recorrido queda en los 25px
// del preset: se le puede subir a la entrada con withInitialValues, pero la
// salida tiene su destino escrito adentro, así que subirlo las descalza.
const TRAVEL_IN = 100;
const SPRING = { damping: 22, stiffness: 190, mass: 0.6 };

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
    en: (direction === 1 ? FadeInDown : FadeInUp).springify().damping(SPRING.damping).stiffness(SPRING.stiffness).mass(SPRING.mass).withInitialValues({ transform: [{ translateY: direction === 1 ? TRAVEL_IN : -TRAVEL_IN }] }),
    ex: (direction === 1 ? FadeOutUp : FadeOutDown).springify().damping(SPRING.damping).stiffness(SPRING.stiffness).mass(SPRING.mass),
  }),
};
