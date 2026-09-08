import { useEffect, useState } from 'react';
import { Dimensions, StyleSheet } from 'react-native';
import Animated, { Easing, runOnJS, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

const windowHeight = Dimensions.get('window').height;
const DURATION = 300;

// Las transiciones de reanimated (entering/exiting) animan cada página por su
// cuenta, y esa costura se nota. Acá las dos se mueven con un mismo valor, como
// las páginas del scroll horizontal de Inicio: una sola tira que se desplaza.
export default function PageSlider({ pages, page, direction, pageProps }) {
  const [current, setCurrent] = useState(page);
  const [leaving, setLeaving] = useState(null);
  const progress = useSharedValue(0);

  useEffect(() => {
    if (page === current) return;

    setLeaving({ name: current, sign: direction === 1 ? 1 : -1 });
    setCurrent(page);

    progress.value = 0;
    progress.value = withTiming(1, { duration: DURATION, easing: Easing.out(Easing.cubic) }, (finished) => {
      if (finished) runOnJS(setLeaving)(null);
    });
  }, [page]);

  const sign = leaving ? leaving.sign : 1;

  // la que entra viene del borde y llega a 0; la que sale arranca en 0 y se va
  // al borde opuesto. El mismo progress mueve a las dos, así que nunca se abre
  // un hueco entre ellas
  const enteringStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: leaving ? (1 - progress.value) * windowHeight * sign : 0 }],
  }));

  const leavingStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: -progress.value * windowHeight * sign }],
  }));

  const Current = pages[current] || pages.home;
  const Leaving = leaving ? pages[leaving.name] : null;

  return (
    <>
      {Leaving && (
        <Animated.View pointerEvents='none' style={[StyleSheet.absoluteFill, leavingStyle]}>
          <Leaving {...pageProps} />
        </Animated.View>
      )}
      <Animated.View style={[StyleSheet.absoluteFill, enteringStyle]}>
        <Current {...pageProps} />
      </Animated.View>
    </>
  );
}
