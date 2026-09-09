import { useEffect, useState } from 'react';
import { View, Text, Dimensions } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing, withDelay } from 'react-native-reanimated';
import { Image } from 'expo-image';
import { useTheme } from '../../../theme/useTheme';
import { accountCardByName } from '../../../../data.js';
import { fS } from '../../../theme/theme.js';

// Tarjeta ancha, solo para la vista de historial: es más baja, así que deja
// lugar a la lista de movimientos. El resto de las tarjetas son cuadradas y se
// siguen eligiendo por nombre/tipo cuando la cuenta se edita con el teclado.
const WIDE_CARD = require('../../../../assets/images/card_wide.png');
// Proporción del archivo, que se respeta siempre: el alto sale del ancho.
export const WIDE_CARD_ASPECT = 482 / 172;
// La tarjeta dibujada no ocupa el PNG entero: abajo lleva sombra. Estas
// fracciones, medidas sobre el alfa, son la banda que ocupa de verdad — el
// texto se centra contra eso y no contra la imagen.
const WIDE_FACE_TOP = 1 / 172;
const WIDE_FACE_HEIGHT = 150 / 172;

export const CARD_RATIO = 0.9;
// la ancha se coloca por su borde de arriba; la cuadrada se centra en su bloque
export const WIDE_CARD_TOP = 0.055;
const SQUARE_BLOCK_HEIGHT = 0.6;

export default function AccountCard({ amountValue, account, wide = false }) {
  const theme = useTheme();
  const windowHeight = Dimensions.get('window').height;
  const windowWidth = Dimensions.get('window').width;

  const cardWidth = windowWidth * CARD_RATIO;
  const cardHeight = wide ? cardWidth / WIDE_CARD_ASPECT : cardWidth;

  const rotation = useSharedValue(100);
  const textOpacity = useSharedValue(0);

  const [localInfo] = useState({
    accountNameToRender: account.id === 'account_aylin' ? 'Saldo de Aylin' : account.id === 'account_matias' ? 'Saldo de Matías' : account.name,
    imageToRender: wide
      ? WIDE_CARD
      : accountCardByName[account.type]?.[account.name]
        ? accountCardByName[account.type][account.name]
        : account.id === 'account_aylin'
          ? require('../../../../assets/images/card_pink-purple.png')
          : account.id === 'account_matias'
            ? require('../../../../assets/images/card_black-blue.png')
            : account.id === 'account_aylin_salary' || account.type === 'a_account'
              ? require('../../../../assets/images/card_pink-purple.png')
              : require('../../../../assets/images/card_black-blue.png'),
  });

  useEffect(() => {
    rotation.value = withTiming(360, {
      duration: 600,
      easing: Easing.out(Easing.cubic),
    });
    textOpacity.value = withDelay(
      200,
      withTiming(1, {
        duration: 400,
      }),
    );
  }, []);

  // todas las tarjetas que quedan son oscuras (la gris era la de las cuentas con
  // sub-cuentas, que ya no existen)
  const cardTextColor = theme.text.onCard;

  const opacityAnimatedStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
  }));

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ perspective: 1000 }, { rotateX: `${rotation.value}deg` }],
  }));

  // la ancha ocupa lo que mide y va arriba; la cuadrada conserva su bloque de
  // media pantalla, que es lo que la centra sobre el teclado
  const blockStyle = wide ? { height: cardHeight, top: windowHeight * WIDE_CARD_TOP, alignItems: 'center' } : { height: windowHeight * SQUARE_BLOCK_HEIGHT, top: 0, justifyContent: 'center', alignItems: 'center' };

  // el texto se centra contra la cara de la tarjeta; en la cuadrada eso es la
  // imagen entera, en la ancha solo la banda sin sombra
  const faceStyle = wide ? { top: cardHeight * WIDE_FACE_TOP, height: cardHeight * WIDE_FACE_HEIGHT } : { top: 0, height: cardHeight };

  return (
    <Animated.View style={[{ position: 'absolute', width: windowWidth, left: 0 }, blockStyle, animatedStyle]}>
      <View style={{ width: cardWidth, height: cardHeight }}>
        <Image source={localInfo.imageToRender} contentFit='contain' style={{ width: cardWidth, height: cardHeight }} transition={400}></Image>
        <Animated.View style={[{ position: 'absolute', left: 0, width: cardWidth, justifyContent: 'center', alignItems: 'center' }, faceStyle, opacityAnimatedStyle]}>
          <Text
            style={{
              color: cardTextColor,
              fontWeight: 400,
              fontSize: fS.accountCardText,
              textAlign: 'center',
            }}
          >
            {localInfo.accountNameToRender}
          </Text>
          {/* el monto se edita con el teclado custom, esto es solo para mostrarlo */}
          <Text
            style={{
              textAlign: 'center',
              color: cardTextColor,
              fontSize: wide ? fS.accountCardNumberWide : fS.accountCardNumber,
            }}
          >
            {`${account?.isNegative ? '-' : ''}$${Number(amountValue).toLocaleString('es-CL')}`}
          </Text>
        </Animated.View>
      </View>
    </Animated.View>
  );
}
