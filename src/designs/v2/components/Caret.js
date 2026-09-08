import { useEffect } from 'react';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, withSequence, Easing } from 'react-native-reanimated';
import { useTheme } from '../../../theme/useTheme';

// Cursor que parpadea. Los montos se editan con el teclado propio, así que el
// campo no es un input de verdad y no trae ninguno.
export default function Caret({ height = 20 }) {
  const theme = useTheme();
  const opacity = useSharedValue(1);

  useEffect(() => {
    // corte seco, como el cursor del sistema: se prende y se apaga, no se funde
    opacity.value = withRepeat(withSequence(withTiming(1, { duration: 0 }), withTiming(1, { duration: 500, easing: Easing.linear }), withTiming(0, { duration: 0 }), withTiming(0, { duration: 500, easing: Easing.linear })), -1, false);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return <Animated.View style={[{ width: 2, height, borderRadius: 1, backgroundColor: theme.bg.blue, marginLeft: 2 }, animatedStyle]} />;
}
