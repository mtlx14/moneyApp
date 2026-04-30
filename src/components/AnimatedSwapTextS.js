import { useEffect, useRef, useState } from 'react';
import Animated, { SlideInUp, SlideOutUp, SlideInDown, SlideOutDown, FadeInDown, FadeOutUp } from 'react-native-reanimated';
import { useTheme } from '../theme/useTheme';
import { View, Text } from 'react-native';
import { fS } from '../theme/theme';

export default function AnimatedSwapTextS({ value, type = 'normal' }) {
  const theme = useTheme();

  const valuesRef = useRef({
    one: value,
    two: value,
  });
  const [showNew, setShowNew] = useState(false);

  useEffect(() => {
    setShowNew((v) => {
      const next = !v;
      const key = next ? 'two' : 'one';

      valuesRef.current[key] = value;

      return next;
    });
  }, [value]);

  return (
    <>
      {!showNew ? (
        <Animated.View key={'one'} entering={FadeInDown.duration(180).delay(100)} exiting={FadeOutUp.duration(100).delay(100)} style={{ flexDirection: 'row', gap: 1, alignItems: 'baseline' }}>
          <Text style={{ color: type === 'debt' ? theme.text.red : type === 'green' ? theme.text.green : type === 'income' ? theme.text.green : theme.text._2, fontWeight: theme.fw.home_acc_text, fontSize: fS.animatedSwapTextS_Suf }}>{type === 'debt' ? '- $' : type === 'income' ? '+ $' : '$'}</Text>
          <Text style={{ color: type === 'debt' ? theme.text.red : type === 'green' ? theme.text.green : type === 'income' ? theme.text.green : theme.text._2, fontWeight: theme.fw.home_acc_text, fontSize: fS.animatedSwapTextS_Number }}>{Number(valuesRef.current.one).toLocaleString('es-CL')}</Text>
        </Animated.View>
      ) : (
        <Animated.View key={'two'} entering={FadeInDown.duration(180).delay(100)} exiting={FadeOutUp.duration(100).delay(100)} style={{ flexDirection: 'row', gap: 1, alignItems: 'baseline' }}>
          <Text style={{ color: type === 'debt' ? theme.text.red : type === 'green' ? theme.text.green : type === 'income' ? theme.text.green : theme.text._2, fontWeight: theme.fw.home_acc_text, fontSize: fS.animatedSwapTextS_Suf }}>{type === 'debt' ? '- $' : type === 'income' ? '+ $' : '$'}</Text>
          <Text style={{ color: type === 'debt' ? theme.text.red : type === 'green' ? theme.text.green : type === 'income' ? theme.text.green : theme.text._2, fontWeight: theme.fw.home_acc_text, fontSize: fS.animatedSwapTextS_Number }}>{Number(valuesRef.current.two).toLocaleString('es-CL')}</Text>
        </Animated.View>
      )}
    </>
  );
}
