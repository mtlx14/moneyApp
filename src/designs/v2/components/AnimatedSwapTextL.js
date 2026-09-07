import { useEffect, useRef, useState } from 'react';
import { Text } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, runOnJS, withSequence, withDelay } from 'react-native-reanimated';
import { useTheme } from '../../../theme/useTheme';
import { fS, fW } from '../../../theme/theme';

export default function AnimatedSwapTextL({ value, color }) {
  const theme = useTheme();
  const textColor = color || theme.text._1;

  const [displayValue, setDisplayValue] = useState(value);
  const isFirstRender = useRef(true);

  const translateY = useSharedValue(0);
  const opacity = useSharedValue(1);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    translateY.value = withDelay(120, withTiming(-12, { duration: 120 }));
    opacity.value = withDelay(
      120,
      withTiming(0, { duration: 120 }, () => {
        runOnJS(setDisplayValue)(value);

        translateY.value = withSequence(withTiming(12, { duration: 0 }), withTiming(0, { duration: 120 }));

        opacity.value = withTiming(1, { duration: 120 });
      }),
    );
  }, [value]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          flexDirection: 'row',
          gap: 2,
          alignItems: 'baseline',
        },
        animatedStyle,
      ]}
    >
      <Text style={{ color: textColor, fontWeight: 200, fontSize: 20 }}>$</Text>
      <Text style={{ color: textColor, fontWeight: fW[100], fontSize: fS.animatedSwapTextL }}>{Number(displayValue).toLocaleString('es-CL')}</Text>
    </Animated.View>
  );
}
