import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { Platform } from 'react-native';

import { StyleSheet, Text, View, Dimensions } from 'react-native';
import Home from './src/pages/Home.js';

import { DataProvider } from './context.js';
import { useTheme } from './src/theme/useTheme.js';
import MainMenu from './src/components/MainMenu.js';
import { useEffect, useState } from 'react';
import FixedExpenses from './src/pages/FixedExpenses.js';
import Monthly_summary from './src/pages/Monthly_summary.js';
import Subscriptions from './src/pages/Subscriptions.js';
import Matias_accounts from './src/pages/Matias_accounts.js';
import { AppStorageProvider } from './appStorageProvider.js';
import GradientBackground from './src/components/GradientBackground.js';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { FadeInLeft, FadeInRight, FadeOutLeft, FadeOutRight, SlideInLeft, SlideInRight, SlideOutLeft, SlideOutRight } from 'react-native-reanimated';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [fontsLoaded] = useFonts({
    SansCode: require('./assets/fonts/SansCode.ttf'),
  });

  const [showMenu, setShowMenu] = useState(true);
  const [page, setPage] = useState('home');
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    const prepare = async () => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      await SplashScreen.hideAsync();
    };

    prepare();
  }, []);

  const navigate = (newPage, dir = 1) => {
    setDirection(dir);
    setTimeout(() => {
      setPage(newPage);
    }, 20);
  };

  const nAnimations = {
    en: direction === 1 ? SlideInRight : SlideInLeft,
    ex: direction === 1 ? SlideOutLeft : SlideOutRight,
  };

  return (
    <DataProvider>
      <AppStorageProvider>
        <SafeAreaProvider>
          <GradientBackground>
            {page === 'home' && <Home setShowMenu={setShowMenu} navigate={navigate} nAnimations={nAnimations} />}
            {page === 'fixed_expenses' && <FixedExpenses setShowMenu={setShowMenu} />}
            {page === 'monthly_summary' && <Monthly_summary setShowMenu={setShowMenu} navigate={navigate} nAnimations={nAnimations} />}
            {page === 'subscriptions' && <Subscriptions navigate={navigate} setShowMenu={setShowMenu} nAnimations={nAnimations} />}
            {page === 'matias_accounts' && <Matias_accounts navigate={navigate} setShowMenu={setShowMenu} nAnimations={nAnimations} />}
            {showMenu && <MainMenu page={page} navigate={navigate} />}
            {/* <MainBar /> */}
          </GradientBackground>
        </SafeAreaProvider>
      </AppStorageProvider>
    </DataProvider>
  );
}
