import { useEffect, useRef } from 'react';
import { Dimensions, Platform, View } from 'react-native';
import Animated, { runOnJS, useAnimatedScrollHandler, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';

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
      // Al cruzar el umbral el scroll queda corrido y el ScrollView lo devuelve a
      // su lugar con su propia animación de paginado: lo que se está yendo se ve
      // volver al centro antes de desaparecer. Así que la página se apaga en el
      // acto, el scroll vuelve a su lugar a oscuras —en el frame siguiente, con
      // el contenido nuevo ya montado— y recién ahí se enciende de vuelta. Ese
      // encendido es la animación de la vuelta
      goBackOpacity.value = 0;
      requestAnimationFrame(() => scrollRef.current?.scrollTo({ x: windowWidth * 0.5, animated: false }));
      goBackOpacity.value = withDelay(60, withTiming(1, { duration: 180 }));
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
  // El único lugar donde el scroll se queda es su posición de reposo. En nativo
  // hay que decirlo: pagingEnabled ancla de a pantallas, así que soltando a
  // medio camino el scroll se quedaba en 0 —abierto— y desde ahí el gesto
  // volvía a cruzar el umbral solo, sin nada que cerrar, y salía al inicio.
  // En web el único anclaje que existe es pagingEnabled, que ancla al principio
  // de cada hijo: el separador y el contenido, que es justo lo que se quiere
  const snapProps = Platform.OS === 'web' ? { pagingEnabled: true } : { snapToOffsets: [windowWidth * 0.5], snapToStart: false, snapToEnd: false, disableIntervalMomentum: true };

  return (
    <Animated.ScrollView entering={entering} exiting={exiting} ref={scrollRef} horizontal scrollEventThrottle={16} {...snapProps} showsHorizontalScrollIndicator={false} onScroll={handleGoBackScroll} contentOffset={{ x: windowWidth * 0.5 }} onContentSizeChange={handleContentSizeChange} decelerationRate={'fast'}>
      <View style={{ width: windowWidth * 0.5 }} />
      <Animated.View style={{ opacity: goBackOpacity }}>{children}</Animated.View>
    </Animated.ScrollView>
  );
}
