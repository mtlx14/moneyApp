import { useRef } from 'react';
import { Dimensions, View } from 'react-native';
import Animated, { runOnJS, useAnimatedScrollHandler, useSharedValue, withTiming } from 'react-native-reanimated';

// Recibe la animación de página y la aplica sobre su propio ScrollView: así el
// nodo animado es el más externo de la página, como en Inicio. Envuelto en otra
// vista, la entrada no recorría.
export default function GoBackScroll({ page = 'home', children, navigate, entering, exiting, onBack }) {
  const windowWidth = Dimensions.get('window').width;

  const scrollRef = useRef(null);
  const didInitScroll = useRef(false);
  // el handler es un worklet y se queda con la primera versión de la prop: el
  // paso atrás se busca en un ref para que siempre vea el estado de ahora
  const onBackRef = useRef(onBack);
  onBackRef.current = onBack;

  const goBackOpacity = useSharedValue(1);
  // el handler sigue corriendo después de cruzar el umbral: sin esto navigate se llama
  // en cada frame y el fade por frame le pisa el withTiming, que es lo que parpadea
  const hasNavigated = useSharedValue(false);

  // En web, contentOffset no se aplica de forma fiable al montar.
  // Forzamos el scroll inicial cuando el contenido ya está medido.
  const handleContentSizeChange = () => {
    if (didInitScroll.current) return;
    didInitScroll.current = true;
    scrollRef.current?.scrollTo({ x: windowWidth * 0.5, animated: false });
  };

  // si la página tiene algo abierto encima (una cuenta, el detalle de un
  // movimiento), el gesto cierra eso y se queda; si no, sale de la página
  const goBack = () => {
    if (onBackRef.current?.()) {
      scrollRef.current?.scrollTo({ x: windowWidth * 0.5, animated: false });
      goBackOpacity.value = withTiming(1, { duration: 150 });
      // recién cuando el scroll ya volvió a su lugar se vuelve a armar el gesto
      setTimeout(() => (hasNavigated.value = false), 200);
      return;
    }

    navigate(page, 0);
    goBackOpacity.value = withTiming(0, {
      duration: 100,
    });
  };

  const handleGoBackScroll = useAnimatedScrollHandler((e) => {
    if (hasNavigated.value) return;

    const { x } = e.contentOffset;
    goBackOpacity.value = x / (windowWidth * 0.5);

    if (x < windowWidth * 0.25) {
      hasNavigated.value = true;
      runOnJS(goBack)();
    }
  });
  return (
    <Animated.ScrollView entering={entering} exiting={exiting} ref={scrollRef} horizontal scrollEventThrottle={16} pagingEnabled showsHorizontalScrollIndicator={false} onScroll={handleGoBackScroll} contentOffset={{ x: windowWidth * 0.5 }} onContentSizeChange={handleContentSizeChange} decelerationRate={'fast'}>
      <View style={{ width: windowWidth * 0.5 }} />
      <Animated.View style={{ opacity: goBackOpacity }}>{children}</Animated.View>
    </Animated.ScrollView>
  );
}
