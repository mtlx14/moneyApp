import { useEffect, useState } from 'react';
import { View, Text, Dimensions, Pressable } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing, withSequence, withDelay } from 'react-native-reanimated';
import { Image } from 'expo-image';
import { useTheme } from '../../../theme/useTheme';
import { useData } from '../../../../context';
import { accountCardByName, subAccountCard } from '../../../../data.js';
import { fS } from '../../../theme/theme.js';

// Versión gris de la tarjeta sin marca, para que se despegue del papel: la
// blanca original desaparecía sobre el fondo claro. Lleva texto oscuro.
const LIGHT_CARD = require('../../../../assets/images/card_light.png');

// Tarjeta ancha, solo para la tarjeta de crédito: es más baja, así que deja
// lugar a la lista de compras. El resto de las tarjetas son cuadradas y se
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

// note es una línea chica opcional debajo del monto (la tarjeta de crédito dice
// ahí lo del mes siguiente)
export default function AccountCard({ amountValue, account, wide = false, note, setLocalInfoMAccount = null }) {
  const theme = useTheme();
  const { accounts } = useData();
  const windowHeight = Dimensions.get('window').height;
  const windowWidth = Dimensions.get('window').width;

  const cardWidth = windowWidth * CARD_RATIO;
  const cardHeight = wide ? cardWidth / WIDE_CARD_ASPECT : cardWidth;

  const rotation = useSharedValue(100);
  const textOpacity = useSharedValue(0);

  const [localInfo, setLocalInfo] = useState({
    accountNameToRender: account.id === 'account_aylin' ? 'Saldo de Aylin' : account.id === 'account_matias' ? 'Saldo de Matías' : account.type === 'sub_account' ? `${accounts.find((a) => a.id === account.forAccount)?.name} - ${account.name}` : account.hasSubAccount ? 'Agregar cuenta' : account.name,
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
              : account.hasSubAccount
                ? LIGHT_CARD
                : require('../../../../assets/images/card_black-blue.png'),
  });

  const subAccounts = account.hasSubAccount ? accounts.filter((a) => a.type === 'sub_account' && a.forAccount === account.id && !a.isActive) : [];

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

  const cardTextColor = localInfo.imageToRender === LIGHT_CARD ? theme.text.strong : theme.text.onCard;

  const opacityAnimatedStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
  }));

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ perspective: 1000 }, { rotateX: `${rotation.value}deg` }],
  }));

  const handleOnPressSubAccount = (subAccount) => {
    setLocalInfo((prev) => ({
      ...prev,
      accountNameToRender: subAccount.name,
      imageToRender: subAccountCard[subAccount.name],
    }));
    setLocalInfoMAccount((prev) => ({
      ...prev,
      subAccountToSave: subAccount,
    }));
    rotation.value = withSequence(
      withTiming(180, {
        duration: 0,
        easing: Easing.out(Easing.cubic),
      }),
      withTiming(360, {
        duration: 600,
        easing: Easing.out(Easing.cubic),
      }),
    );
    textOpacity.value = withSequence(
      withTiming(0, {
        duration: 0,
      }),
      withDelay(
        100,
        withTiming(1, {
          duration: 400,
        }),
      ),
    );
  };

  // la ancha ocupa lo que mide y va arriba; la cuadrada conserva su bloque de
  // media pantalla, que es lo que la centra sobre el teclado
  const blockStyle = wide ? { height: cardHeight, top: windowHeight * WIDE_CARD_TOP, alignItems: 'center' } : { height: windowHeight * SQUARE_BLOCK_HEIGHT, top: 0, justifyContent: 'center', alignItems: 'center' };

  // el texto se centra contra la cara de la tarjeta; en la cuadrada eso es la
  // imagen entera, en la ancha solo la banda sin sombra
  // con la línea de abajo el bloque de texto crece y queda con poco aire arriba:
  // se baja un poco, comiéndose parte del espacio de abajo
  const faceStyle = wide ? { top: cardHeight * WIDE_FACE_TOP, height: cardHeight * WIDE_FACE_HEIGHT, paddingTop: note ? 8 : 0 } : { top: 0, height: cardHeight };

  return (
    <>
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
            {!!note && <Text style={{ textAlign: 'center', color: cardTextColor, opacity: 0.7, fontSize: fS.keyboardBtn * 0.8 }}>{note}</Text>}
          </Animated.View>
        </View>
      </Animated.View>
      {/* las sub-cuentas que se pueden agregar a la cuenta, debajo de la tarjeta */}
      <View style={{ position: 'absolute', width: windowWidth, top: windowHeight * 0.46, flexDirection: 'row', justifyContent: 'center', gap: 8 }}>
        {subAccounts.map((subAccount) => {
          return (
            <Pressable
              onPress={() => handleOnPressSubAccount(subAccount)}
              key={subAccount.id}
              style={{
                backgroundColor: theme.bg.tr_1,
                paddingHorizontal: 20,
                paddingVertical: 7,
                borderRadius: 10,
                shadowColor: 'rgba(0, 0, 0, 0.4)',
                shadowOffset: {
                  width: 0,
                  height: 5,
                },
                shadowRadius: 10,
                overflow: 'hidden',
              }}
            >
              <Text style={{ color: theme.text._1, fontSize: fS.userTagName }}>{subAccount.name}</Text>
            </Pressable>
          );
        })}
      </View>
    </>
  );
}
