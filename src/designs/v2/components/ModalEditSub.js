import { BlurView } from 'expo-blur';

import { Alert, Dimensions, Keyboard, Platform, Pressable, Text, TextInput, View } from 'react-native';
import { useTheme } from '../../../theme/useTheme';
import Animated, { useSharedValue, withDelay, withTiming, Easing, useAnimatedStyle, FadeInDown, LinearTransition, FadeInRight, FadeOutRight, SlideInRight, SlideOutRight } from 'react-native-reanimated';
import { useEffect, useRef, useState } from 'react';
import { fS } from '../../../theme/theme';
import { useData } from '../../../../context';
import { deleteBill, updateBill } from '../../../services';
import { Image } from 'expo-image';
import { Keyboard as CustomKeyboard } from './Keyboard';

export default function ModalEditSub({ bill = {}, onCancel, setShowMenu }) {
  // congeladas al montar: en web el teclado nativo achica window.innerHeight, y releerlas
  // en cada render encoge el modal y lo corre hacia arriba mientras se escribe
  const [{ width: windowWidth, height: windowHeight }] = useState(() => Dimensions.get('window'));
  const { bills } = useData();
  const theme = useTheme();
  const [currentBill, setCurrentBill] = useState(bill);
  const [amountKeyboard, setAmountKeyboard] = useState(false);

  const fields = ['label', 'emoji', 'amount', 'payDay'];
  const fieldsLabels = ['Nombre', 'Emoji', 'Monto', 'Día de pago'];

  const confirmationAction = () => {
    if (Platform.OS === 'web') {
      const ok = window.confirm('¿Estas seguro que quieres eliminar esta suscripción?');
      if (ok) {
        deleteBill({ bill: currentBill });
        onCancel();
      }
    } else {
      Alert.alert('Eliminar suscripción', '¿Estas seguro que quieres eliminar esta suscripción?', [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', onPress: () => (deleteBill({ bill: currentBill }), onCancel()) },
      ]);
    }
  };

  // el menú estorba en el modal, se esconde mientras está abierto
  useEffect(() => {
    if (!setShowMenu) return;
    setShowMenu(false);
    return () => setShowMenu(true);
  }, []);

  const openTimer = useRef(null);

  // el navegador suelta el foco del input antes de que corra el onPress, así que para
  // saber si había teclado nativo nos guardamos el estado en vez de mirar activeElement
  const focusState = useRef({ focused: false, blurredAt: 0 });
  // en estado además del ref porque el escudo depende de esto y el ref no re-renderiza
  const [inputFocused, setInputFocused] = useState(false);

  const inputFocusProps = {
    onFocus: () => {
      focusState.current = { focused: true, blurredAt: 0 };
      setInputFocused(true);
      // si el custom estaba abierto se cierra: no pueden convivir con el nativo
      clearTimeout(openTimer.current);
      setAmountKeyboard(false);
    },
    onBlur: () => {
      focusState.current = { focused: false, blurredAt: Date.now() };
      setInputFocused(false);
    },
  };

  // hay teclado en pantalla, sea el custom o el del sistema
  const keyboardOpen = amountKeyboard || inputFocused;

  const closeKeyboards = () => {
    clearTimeout(openTimer.current);
    setAmountKeyboard(false);
    if (Platform.OS === 'web') document.activeElement?.blur?.();
    else Keyboard.dismiss();
  };

  const systemKeyboardOpen = () => {
    if (Platform.OS !== 'web') return Keyboard.isVisible();
    const { focused, blurredAt } = focusState.current;
    return focused || Date.now() - blurredAt < 400;
  };

  useEffect(() => () => clearTimeout(openTimer.current), []);

  const openKeyboard = () => {
    clearTimeout(openTimer.current);

    const wasOpen = systemKeyboardOpen();

    if (Platform.OS === 'web') document.activeElement?.blur?.();
    else Keyboard.dismiss();

    // el teclado nativo tarda en cerrarse, si montamos el custom antes queda mal puesto
    if (wasOpen) openTimer.current = setTimeout(() => setAmountKeyboard(true), 400);
    else setAmountKeyboard(true);
  };

  const Wrap = Platform.OS === 'web' ? View : Pressable;
  const wrapProps = Platform.OS === 'web' ? {} : { onPress: Keyboard.dismiss };

  return (
    <Animated.View entering={FadeInDown} style={[{ position: 'absolute', width: windowWidth, height: windowHeight, top: 0, left: 0 }]}>
      {/* con el teclado abierto, un toque fuera del modal solo lo cierra. Va detrás del
          contenido, así lo de adentro del modal sigue funcionando normal */}
      {keyboardOpen && <Pressable onPress={closeKeyboards} style={{ position: 'absolute', top: 0, left: 0, width: windowWidth, height: windowHeight }} />}

      <Wrap {...wrapProps} pointerEvents={keyboardOpen ? 'box-none' : 'auto'}>
        <Animated.View entering={FadeInDown} pointerEvents={keyboardOpen ? 'box-none' : 'auto'} style={[{ width: windowWidth, height: windowHeight * 0.6, justifyContent: 'center', alignItems: 'center' }]}>
          <BlurView intensity={30} style={{ width: windowWidth * 0.8, borderRadius: 20, overflow: 'hidden' }}>
            {fields.map((field, index) => {
              const rField = currentBill[field] ? (currentBill[field] === 'fixed' ? 'Gasto fijo' : currentBill[field] === 'planned' ? 'Gasto planeado' : String(currentBill[field])) : '';
              const isNumber = ['amount', 'payDay'].includes(field);
              return (
                <View key={field}>
                  {index > 0 && <View style={{ width: '100%', height: 1, backgroundColor: theme.bg.tr_3 }}></View>}
                  <View style={{ justifyContent: 'center', alignItems: 'center', height: windowWidth * 0.12, backgroundColor: theme.bg.tr_1, justifyContent: 'flex-start', flexDirection: 'row' }}>
                    <View style={{ backgroundColor: theme.bg.tr_1, height: '100%', justifyContent: 'center', paddingLeft: 15, paddingRight: 10, width: '33%' }}>
                      <Text style={{ color: theme.text._2, fontSize: fS.modalTransfer }}>{`${fieldsLabels[index]}:`}</Text>
                    </View>

                    {field === 'amount' ? (
                      <Pressable
                        style={{ flex: 1, height: '100%', justifyContent: 'center' }}
                        onPress={() => openKeyboard()}
                      >
                        <Text style={{ color: theme.text._1, fontSize: fS.modalTransfer, paddingLeft: 10 }}>{rField}</Text>
                      </Pressable>
                    ) : (
                      <TextInput
                        {...inputFocusProps}
                        style={{ color: theme.text._1, fontSize: fS.modalTransfer, paddingLeft: 10, flex: 1, height: '100%' }}
                        value={rField}
                        keyboardType={isNumber ? 'numeric' : 'default'}
                        keyboardAppearance='dark'
                        onChangeText={(text) =>
                          setCurrentBill((prev) => ({
                            ...prev,
                            [field]: isNumber ? Number(text) : text,
                          }))
                        }
                      ></TextInput>
                    )}
                  </View>
                </View>
              );
            })}
          </BlurView>
          {/* los botones quedan fuera del modal: con el teclado abierto no reciben el
              toque, se lo lleva el escudo de atrás y solo cierra el teclado */}
          <Animated.View layout={LinearTransition} pointerEvents={keyboardOpen ? 'none' : 'auto'} style={{ marginRight: windowWidth * 0.2, marginTop: 10, flexDirection: 'row', justifyContent: 'flex-end', width: '100%', gap: 8 }}>
            <Animated.View layout={LinearTransition}>
              <Pressable onPress={() => confirmationAction()} style={{ backgroundColor: theme.bg.danger, borderRadius: 100, height: windowWidth * 0.08, width: windowWidth * 0.1, justifyContent: 'center', alignItems: 'center' }}>
                <Image style={{ height: windowWidth * 0.055, aspectRatio: 1 / 1, opacity: 0.9 }} source={require('../../../../assets/icons/trash.png')}></Image>
              </Pressable>
            </Animated.View>
            <Animated.View layout={LinearTransition}>
              <Pressable onPress={() => onCancel()} style={{ backgroundColor: theme.bg.tr_2, borderRadius: 100, height: windowWidth * 0.08, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ color: theme.text._1, fontSize: fS.modalTransfer, paddingHorizontal: 20 }}>Cancelar</Text>
              </Pressable>
            </Animated.View>
            {JSON.stringify(currentBill) !== JSON.stringify(bills.find((b) => b.id === currentBill.id)) && fields.every((field) => field in currentBill) && (
              <Animated.View layout={LinearTransition} entering={SlideInRight} exiting={SlideOutRight}>
                <Pressable onPress={() => (updateBill({ bill: { ...currentBill, type: 'sub' } }), onCancel())} style={{ backgroundColor: theme.bg.check, borderRadius: 100, height: windowWidth * 0.08, justifyContent: 'center', alignItems: 'center' }}>
                  <Text style={{ color: theme.text._1, fontSize: fS.modalTransfer, paddingHorizontal: 20 }}>Guardar</Text>
                </Pressable>
              </Animated.View>
            )}
          </Animated.View>
        </Animated.View>
      </Wrap>

      {/* teclado personalizado para el monto ------------------------------------ */}

      {amountKeyboard && (
        <CustomKeyboard
          initialValue={currentBill.amount ? String(currentBill.amount) : '0'}
          onChange={(nextValue) => setCurrentBill((prev) => ({ ...prev, amount: Number(nextValue) }))}
          onConfirm={(nextValue) => {
            setCurrentBill((prev) => ({ ...prev, amount: Number(nextValue) }));
            setAmountKeyboard(false);
          }}
        />
      )}
    </Animated.View>
  );
}
