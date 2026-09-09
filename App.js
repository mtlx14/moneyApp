import { useFonts } from 'expo-font';
import { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';

import { DataProvider } from './context.js';
import { AppStorageProvider } from './appStorageProvider.js';
import { useDesign } from './src/designs/index.js';

SplashScreen.preventAutoHideAsync();

// Resuelve las páginas y el chrome contra el diseño del tema activo. Tiene que
// vivir dentro de los providers porque useDesign lee el tema del usuario.
function AppContent() {
  const design = useDesign();
  const { pages, MainMenu, GradientBackground, pageAnimations } = design;

  const [showMenu, setShowMenu] = useState(true);
  const [page, setPage] = useState('home');
  const [direction, setDirection] = useState(1);

  const navigate = (newPage, dir = 1) => {
    setDirection(dir);
    setTimeout(() => {
      setPage(newPage);
    }, 20);
  };

  const nAnimations = pageAnimations(direction);

  return (
    <GradientBackground>
      {/* Cada página ocupa su propio lugar en el árbol, no un slot compartido
          con key: si entra y sale en la misma posición, React desmonta y monta
          en el mismo commit y reanimated no alcanza a animar la salida. */}
      {Object.keys(pages).map((name) => {
        if (name !== page) return null;
        const Page = pages[name];

        return <Page key={`${design.name}_${name}`} setShowMenu={setShowMenu} navigate={navigate} nAnimations={nAnimations} />;
      })}
      {showMenu && <MainMenu page={page} navigate={navigate} />}
    </GradientBackground>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    SansCode: require('./assets/fonts/SansCode.ttf'),
    MaterialSymbols: require('./assets/fonts/MaterialSymbolsRounded.ttf'),
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
