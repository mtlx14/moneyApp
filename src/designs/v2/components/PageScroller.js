import { Dimensions, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const windowWidth = Dimensions.get('window').width;

const DURATION = 380;
// Curva de scroll: sale disparada y se va frenando hasta apoyar. Es la misma
// forma que tiene el snap de una lista al soltarla.
const EASING = Easing.bezier(0.22, 1, 0.36, 1);

// Las páginas van apiladas dentro de una tira que se desplaza, como los dos
// paneles del scroll horizontal de Inicio.
//
// Es importante que estén en el flujo, una debajo de otra, y no superpuestas:
// las páginas no tienen fondo propio (el papel lo pinta GradientBackground), así
// que si se solapan durante la transición se ven los dos contenidos encimados.
export default function PageScroller({ pages, order, page, pageProps }) {
  const insets = useSafeAreaInsets();
  const pageHeight = Dimensions.get('window').height - insets.top;

  const index = Math.max(0, order.indexOf(page));

  const stripStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: withTiming(-index * pageHeight, { duration: DURATION, easing: EASING }) }],
  }));

  return (
    <View style={{ width: windowWidth, height: pageHeight, overflow: 'hidden' }}>
      <Animated.View style={[{ width: windowWidth }, stripStyle]}>
        {order.map((name) => {
          const Page = pages[name];
          if (!Page) return null;

          return (
            <View key={name} style={{ height: pageHeight, width: windowWidth, overflow: 'hidden' }}>
              <Page {...pageProps} />
            </View>
          );
        })}
      </Animated.View>
    </View>
  );
}
