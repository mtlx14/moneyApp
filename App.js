import { useFonts } from 'expo-font';
import { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SlideInLeft, SlideInRight, SlideOutLeft, SlideOutRight } from 'react-native-reanimated';
import * as SplashScreen from 'expo-splash-screen';

import { DataProvider } from './context.js';
import { AppStorageProvider } from './appStorageProvider.js';
import { useDesign } from './src/designs/index.js';

SplashScreen.preventAutoHideAsync();

// Resuelve las páginas y el chrome contra el diseño del tema activo. Tiene que
// vivir dentro de los providers porque useDesign lee el tema del usuario.
function AppContent() {
  const design = useDesign();
  const { pages, MainMenu, GradientBackground } = design;

  const [showMenu, setShowMenu] = useState(true);
  const [page, setPage] = useState('home');
  const [direction, setDirection] = useState(1);

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

  const Page = pages[page] || pages.home;

  return (
    <GradientBackground>
      <Page key={`${design.name}_${page}`} setShowMenu={setShowMenu} navigate={navigate} nAnimations={nAnimations} />
      {showMenu && <MainMenu page={page} navigate={navigate} />}
    </GradientBackground>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    SansCode: require('./assets/fonts/SansCode.ttf'),
  });

  useEffect(() => {
    const prepare = async () => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      await SplashScreen.hideAsync();
    };

    prepare();
  }, []);

  return (
    <AppStorageProvider>
      <DataProvider>
        <SafeAreaProvider>
          <AppContent />
        </SafeAreaProvider>
      </DataProvider>
    </AppStorageProvider>
  );
}
