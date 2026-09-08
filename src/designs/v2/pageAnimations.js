import { Easing, withDelay, withTiming } from 'react-native-reanimated';

// Reanimated no trae un desliz corto: Slide* recorre windowHeight entero y
// Fade* tiene 25px fijos, que se quedan cortos. Estos son a medida.
//
// Van declaradas sueltas y no devueltas por una fábrica: el plugin de babel
// convierte a worklet las funciones con la directiva, y una creada en runtime
// dentro de otra no siempre la toma. Si no es worklet, reanimated no anima y
// tampoco avisa.
const TRAVEL = 70;
const DURATION_OUT = 150;
const DURATION_IN = 190;
// La entrada pisa un poco a la salida. Si espera a que termine queda un hueco
// con la pantalla vacía, y eso es lo que se ve como un salto.
const DELAY_IN = 60;

export const enterFromBelow = () => {
  'worklet';

  return {
    initialValues: { opacity: 0, transform: [{ translateY: TRAVEL }] },
    animations: {
      opacity: withDelay(DELAY_IN, withTiming(1, { duration: DURATION_IN })),
      transform: [{ translateY: withDelay(DELAY_IN, withTiming(0, { duration: DURATION_IN, easing: Easing.out(Easing.quad) })) }],
    },
  };
};

export const enterFromAbove = () => {
  'worklet';

  return {
    initialValues: { opacity: 0, transform: [{ translateY: -TRAVEL }] },
    animations: {
      opacity: withDelay(DELAY_IN, withTiming(1, { duration: DURATION_IN })),
      transform: [{ translateY: withDelay(DELAY_IN, withTiming(0, { duration: DURATION_IN, easing: Easing.out(Easing.quad) })) }],
    },
  };
};

export const exitUp = () => {
  'worklet';

  return {
    initialValues: { opacity: 1, transform: [{ translateY: 0 }] },
    animations: {
      opacity: withTiming(0, { duration: DURATION_OUT }),
      transform: [{ translateY: withTiming(-TRAVEL, { duration: DURATION_OUT, easing: Easing.in(Easing.quad) }) }],
    },
  };
};

export const exitDown = () => {
  'worklet';

  return {
    initialValues: { opacity: 1, transform: [{ translateY: 0 }] },
    animations: {
      opacity: withTiming(0, { duration: DURATION_OUT }),
      transform: [{ translateY: withTiming(TRAVEL, { duration: DURATION_OUT, easing: Easing.in(Easing.quad) }) }],
    },
  };
};
