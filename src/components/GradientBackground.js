import { LinearGradient } from 'expo-linear-gradient';
import { Dimensions, Platform, View } from 'react-native';
import { useTheme } from '../theme/useTheme';
import { useEffect, useState } from 'react';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function GradientBackground({ children }) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const windowHeight = Dimensions.get('window').height;
  const windowWidth = Dimensions.get('window').width;

  const [secondBg, setSecondBg] = useState(false);
  const [colors, setColors] = useState({
    first: [theme.bg.primary_2, theme.bg.primary],
    second: [theme.bg.primary_2, theme.bg.primary],
  });

  if (Platform.OS === 'web') {
    document.body.style.transition = 'background-color 1.1s ';
    document.body.style.backgroundColor = theme.bg.primary;
  }

  const t = 1000;
  useEffect(() => {
    if (secondBg) {
      if (theme.bg.primary_2 !== colors.first[0] && theme.bg.primary !== colors.first[1]) {
        setColors((prev) => ({
          ...prev,
          first: [theme.bg.primary_2, theme.bg.primary],
        }));
        setSecondBg(false);
        setTimeout(() => {
          setColors((prev) => ({
            ...prev,
            second: [theme.bg.primary_2, theme.bg.primary],
          }));
        }, t);
      }
    } else {
      if (theme.bg.primary_2 !== colors.second[0] && theme.bg.primary !== colors.second[1]) {
        setColors((prev) => ({
          ...prev,
          second: [theme.bg.primary_2, theme.bg.primary],
        }));
        setSecondBg(true);
        setTimeout(() => {
          setColors((prev) => ({
            ...prev,
            first: [theme.bg.primary_2, theme.bg.primary],
          }));
        }, t);
      }
    }
  }, [theme]);

  useEffect(() => {}, [colors]);

  return (
    <>
      <View style={{ position: 'absolute', top: 0, left: 0, width: windowWidth, height: windowHeight }}>
        {!secondBg ? (
          <Animated.View key={'first'} entering={FadeIn.duration(t)} exiting={FadeOut.duration(t).delay(t)} style={{ position: 'absolute', inset: 0 }}>
            <LinearGradient colors={colors.first} start={{ x: 0, y: 1 }} end={{ x: 0, y: 0 }} style={{ flex: 1 }} />
          </Animated.View>
        ) : (
          <Animated.View key={'second'} entering={FadeIn.duration(t)} exiting={FadeOut.duration(t).delay(t)} style={{ position: 'absolute', inset: 0 }}>
            <LinearGradient colors={colors.second} start={{ x: 0, y: 1 }} end={{ x: 0, y: 0 }} style={{ flex: 1 }} />
          </Animated.View>
        )}
      </View>
      <View style={{ position: 'absolute', top: insets.top, left: 0, width: windowWidth, height: windowHeight - insets.top }}>{children}</View>
    </>
  );
}
