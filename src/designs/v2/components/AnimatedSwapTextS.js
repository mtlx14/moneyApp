import { useEffect, useRef, useState } from 'react';
import Animated, { SlideInUp, SlideOutUp, SlideInDown, SlideOutDown, FadeInDown, FadeOutUp } from 'react-native-reanimated';
import { useTheme } from '../../../theme/useTheme';
import { View, Text } from 'react-native';
import { fS } from '../../../theme/theme';

export default function AnimatedSwapTextS({ value, type = 'normal' }) {
  const theme = useTheme();

  const valuesRef = useRef({
    one: value,
    two: value,
  });
  const [showNew, setShowNew] = useState(false);

  // en el montaje no hay nada que intercambiar: sin esto el primer render dispara el swap
  // y el valor parpadea al entrar a la página
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    setShowNew((v) => {
      const next = !v;
      const key = next ? 'two' : 'one';

      valuesRef.current[key] = value;

      return next;
    });
  }, [value]);

  // el entering solo tiene sentido en un swap, al montar el valor ya debe estar puesto
  const swapIn = isFirstRender.current ? undefined : FadeInDown.duration(180).delay(100);
  const swapOut = isFirstRender.current ? undefined : FadeOutUp.duration(100).delay(100);

  return (
    <>
      {!showNew ? (
        <Animated.View key={'one'} entering={swapIn} exiting={swapOut} style={{ flexDirection: 'row', gap: 1, alignItems: 'baseline' }}>
          <Text style={{ color: type === 'debt' ? theme.text.red : type === 'green' ? theme.text.green : type === 'income' ? theme.text.green : theme.text._2, fontWeight: theme.fw.home_acc_text, fontSize: fS.animatedSwapTextS_Suf }}>{type === 'debt' ? '- $' : type === 'income' ? '+ $' : '$'}</Text>
          <Text style={{ color: type === 'debt' ? theme.text.red : type === 'green' ? theme.text.green : type === 'income' ? theme.text.green : theme.text._2, fontWeight: theme.fw.home_acc_text, fontSize: fS.animatedSwapTextS_Number }}>{Number(valuesRef.current.one).toLocaleString('es-CL')}</Text>
        </Animated.View>
      ) : (
        <Animated.View key={'two'} entering={swapIn} exiting={swapOut} style={{ flexDirection: 'row', gap: 1, alignItems: 'baseline' }}>
          <Text style={{ color: type === 'debt' ? theme.text.red : type === 'green' ? theme.text.green : type === 'income' ? theme.text.green : theme.text._2, fontWeight: theme.fw.home_acc_text, fontSize: fS.animatedSwapTextS_Suf }}>{type === 'debt' ? '- $' : type === 'income' ? '+ $' : '$'}</Text>
          <Text style={{ color: type === 'debt' ? theme.text.red : type === 'green' ? theme.text.green : type === 'income' ? theme.text.green : theme.text._2, fontWeight: theme.fw.home_acc_text, fontSize: fS.animatedSwapTextS_Number }}>{Number(valuesRef.current.two).toLocaleString('es-CL')}</Text>
        </Animated.View>
      )}
    </>
  );
}
