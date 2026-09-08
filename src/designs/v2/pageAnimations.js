import { Easing, withDelay, withTiming } from 'react-native-reanimated';

// Reanimated no trae un desliz corto: Slide* recorre windowHeight entero y
// Fade* tiene 25px fijos, que se quedan cortos. Estos son a medida.
const TRAVEL = 70;
const DURATION_OUT = 150;
const DURATION_IN = 190;
// La entrada pisa un poco a la salida. Si espera a que termine queda un hueco
// con la pantalla vacía, y eso es lo que se ve como un salto.
const DELAY_IN = 60;

export const enterFrom = (sign) => () => {
  'worklet';

  return {
    initialValues: { opacity: 0, transform: [{ translateY: sign * TRAVEL }] },
    animations: {
      opacity: withDelay(DELAY_IN, withTiming(1, { duration: DURATION_IN })),
      transform: [{ translateY: withDelay(DELAY_IN, withTiming(0, { duration: DURATION_IN, easing: Easing.out(Easing.quad) })) }],
    },
  };
};

export const exitTo = (sign) => () => {
  'worklet';

  return {
    initialValues: { opacity: 1, transform: [{ translateY: 0 }] },
    animations: {
      opacity: withTiming(0, { duration: DURATION_OUT }),
      transform: [{ translateY: withTiming(sign * TRAVEL, { duration: DURATION_OUT, easing: Easing.in(Easing.quad) }) }],
    },
  };
};
