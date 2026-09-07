import { useEffect, useState } from 'react';
import { View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

// fila que entra y sale creciendo/achicando su propio alto, el contenido acompaña
// con fade en vez de aparecer de golpe
export default function CollapsibleRow({ open, children }) {
  const [contentHeight, setContentHeight] = useState(0);
  const progress = useSharedValue(open ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(open ? 1 : 0, { duration: 250, easing: Easing.out(Easing.quad) });
  }, [open]);

  // hasta tener la medida se deja el alto automático para no parpadear en el primer render
  const rowStyle = useAnimatedStyle(() => ({
    height: contentHeight ? progress.value * contentHeight : undefined,
    overflow: 'hidden',
    opacity: progress.value,
  }));

  return (
    <Animated.View pointerEvents={open ? 'auto' : 'none'} style={rowStyle}>
      <View onLayout={(e) => setContentHeight(e.nativeEvent.layout.height)}>{children}</View>
    </Animated.View>
  );
}
