import { Dimensions, Platform, View } from 'react-native';
import { useTheme } from '../../../theme/useTheme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// v2 usa un fondo plano, sin gradiente. Mantiene el nombre del componente para
// que el registry de diseños resuelva igual que en v1.
export default function GradientBackground({ children }) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const windowHeight = Dimensions.get('window').height;
  const windowWidth = Dimensions.get('window').width;

  if (Platform.OS === 'web') {
    document.body.style.transition = 'background-color 1.1s ';
    document.body.style.backgroundColor = theme.bg.primary;
  }

  return (
    <>
      <View style={{ position: 'absolute', top: 0, left: 0, width: windowWidth, height: windowHeight, backgroundColor: theme.bg.primary }}></View>
      <View style={{ position: 'absolute', top: insets.top, left: 0, width: windowWidth, height: windowHeight - insets.top }}>{children}</View>
    </>
  );
}
