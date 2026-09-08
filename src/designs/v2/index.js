import Home from './pages/Home.js';
import FixedExpenses from './pages/FixedExpenses.js';
import Monthly_summary from './pages/Monthly_summary.js';
import Subscriptions from './pages/Subscriptions.js';
import Matias_accounts from './pages/Matias_accounts.js';
import Aylin_accounts from './pages/Aylin_accounts.js';
import MainMenu from './components/MainMenu.js';
import GradientBackground from './components/GradientBackground.js';
import { FadeInDown, FadeInUp, FadeOutDown, FadeOutUp } from 'react-native-reanimated';

const FADE_OUT = 160;
const FADE_IN = 220;

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
  // Las Fade* corren 25px y funden, en vez de arrastrar la pantalla entera.
  // La entrada espera a que termine la salida: si arrancan juntas se pisan y
  // solo se llega a ver una.
  pageAnimations: (direction) => ({
    en: (direction === 1 ? FadeInDown : FadeInUp).duration(FADE_IN).delay(FADE_OUT),
    ex: (direction === 1 ? FadeOutUp : FadeOutDown).duration(FADE_OUT),
  }),
};
