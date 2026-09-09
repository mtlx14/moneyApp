import { useEffect, useRef } from 'react';
import { Dimensions, View } from 'react-native';
import Animated, { runOnJS, useAnimatedScrollHandler, useSharedValue, withTiming } from 'react-native-reanimated';

// Recibe la animación de página y la aplica sobre su propio ScrollView: así el
// nodo animado es el más externo de la página, como en Inicio. Envuelto en otra
// vista, la entrada no recorría.
export default function GoBackScroll({ page = 'home', children, navigate, entering, exiting, onBack, innerStep = false }) {
  const windowWidth = Dimensions.get('window').width;

  const scrollRef = useRef(null);
  const didInitScroll = useRef(false);
  // el handler es un worklet y se queda con la primera versión de la prop: el
  // paso atrás se busca en un ref para que siempre vea el estado de ahora
  const onBackRef = useRef(onBack);
  onBackRef.current = onBack;

  const goBackOpacity = useSharedValue(1);
  // Con algo abierto encima, el gesto no saca de la página sino que cierra eso,
  // que ya tiene su propia animación: apagar además la página entera mientras se
  // arrastra encimaba las dos cosas y se veía sucio. Va en un shared value
  // porque el handler es un worklet y no vería el cambio de la prop
  const hasInnerStep = useSharedValue(innerStep);
  useEffect(() => {
    hasInnerStep.value = innerStep;
  }, [innerStep]);
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
      // Primero se cierra lo de adentro y recién en el frame siguiente vuelve el
      // scroll a su lugar: haciéndolo de una, lo que se estaba yendo se veía
      // deslizar de vuelta al centro antes de desaparecer. Así lo que se corre es
      // el contenido nuevo, tapado por su propia entrada
      requestAnimationFrame(() => scrollRef.current?.scrollTo({ x: windowWidth * 0.5, animated: false }));
      goBackOpacity.value = withTiming(1, { duration: 150 });
      // el gesto se rearma solo cuando el scroll vuelve a su lugar, en el handler
      return;
    }

    navigate(page, 0);
    goBackOpacity.value = withTiming(0, {
      duration: 100,
    });
  };

  const handleGoBackScroll = useAnimatedScrollHandler((e) => {
    const { x } = e.contentOffset;

    if (hasNavigated.value) {
      // Rearmado por posición y no por tiempo: arrastrando despacio, el dedo
      // sigue abajo y el scroll sigue pasado del umbral, así que un rearme a los
      // 200ms disparaba el gesto una segunda vez —y esa segunda, sin paso de
      // adentro que deshacer, se iba al inicio
      if (x > windowWidth * 0.45) hasNavigated.value = false;
      return;
    }

    // la página se apaga mientras se arrastra solo si el gesto la va a dejar; con
    // algo abierto encima la que anima es esa cosa al cerrarse
    if (!hasInnerStep.value) goBackOpacity.value = x / (windowWidth * 0.5);

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
