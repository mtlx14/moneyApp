import { Dimensions, Platform, View } from 'react-native';
import { useTheme } from '../../../theme/useTheme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const GRID = 12;

// Papel plano con cuadrícula, sin gradiente.
export default function GradientBackground({ children }) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const windowHeight = Dimensions.get('window').height;
  const windowWidth = Dimensions.get('window').width;

  if (Platform.OS === 'web') {
    document.body.style.transition = 'background-color 1.1s ';
    document.body.style.backgroundColor = theme.bg.primary;
  }

  // React Native no tiene background-image repetido, así que la cuadrícula son
  // líneas de 1px dibujadas una vez.
  const columns = Math.ceil(windowWidth / GRID);
  const rows = Math.ceil(windowHeight / GRID);

  return (
    <>
      <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, width: windowWidth, height: windowHeight, backgroundColor: theme.bg.primary }}>
        {Array.from({ length: columns }).map((_, i) => (
          <View key={`c${i}`} style={{ position: 'absolute', top: 0, bottom: 0, left: i * GRID, width: 1, backgroundColor: theme.bg.grid }} />
        ))}
        {Array.from({ length: rows }).map((_, i) => (
          <View key={`r${i}`} style={{ position: 'absolute', left: 0, right: 0, top: i * GRID, height: 1, backgroundColor: theme.bg.grid }} />
        ))}
      </View>
      <View style={{ position: 'absolute', top: insets.top, left: 0, width: windowWidth, height: windowHeight - insets.top }}>{children}</View>
    </>
  );
}
