import { Easing, withTiming } from 'react-native-reanimated';

// Reanimated no trae un desliz corto: Slide* recorre windowHeight entero y
// Fade* apenas 25px. Este es el intermedio.
const TRAVEL = 120;
const DURATION = 280;

// La opacidad tiene que estar: el componente que sale sigue montado hasta que
// termina, así que sin fundido quedaría frenado a 120px y desapareciendo de
// golpe. Cierra rápido para que lo que se lea sea el movimiento.
export const enterFrom = (sign) => () => {
  'worklet';

  return {
    initialValues: { opacity: 0, transform: [{ translateY: sign * TRAVEL }] },
    animations: {
      opacity: withTiming(1, { duration: DURATION * 0.7 }),
      transform: [{ translateY: withTiming(0, { duration: DURATION, easing: Easing.out(Easing.cubic) }) }],
    },
  };
};

export const exitTo = (sign) => () => {
  'worklet';

  return {
    initialValues: { opacity: 1, transform: [{ translateY: 0 }] },
    animations: {
      opacity: withTiming(0, { duration: DURATION * 0.6 }),
      transform: [{ translateY: withTiming(sign * TRAVEL, { duration: DURATION, easing: Easing.in(Easing.cubic) }) }],
    },
  };
};
