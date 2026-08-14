import { BlurView } from 'expo-blur';

import { Alert, Dimensions, Keyboard, Platform, Pressable, Text, TextInput, View } from 'react-native';
import { useTheme } from '../theme/useTheme';
import Animated, { useSharedValue, withDelay, withTiming, Easing, useAnimatedStyle, FadeInDown, LinearTransition, FadeInRight, FadeOutRight, SlideInRight, SlideOutRight, FadeOut, FadeIn } from 'react-native-reanimated';
import { useEffect, useRef, useState } from 'react';
import { fS } from '../theme/theme';
import { useData } from '../../context';
import { deleteBill, updateBill } from '../services';
import { Image } from 'expo-image';
import { createTimestamp, getMonth, getNextMonth, getYear, getYearOfNextMonth } from '../helpers';
import { Keyboard as CustomKeyboard } from './Keyboard';

export default function ModalEditAccount({ bill = {}, onCancel, setShowMenu }) {
  // congeladas al montar: en web el teclado nativo achica window.innerHeight, y releerlas
  // en cada render encoge el modal y lo corre hacia arriba mientras se escribe
  const [{ width: windowWidth, height: windowHeight }] = useState(() => Dimensions.get('window'));
  const { bills } = useData();
  const theme = useTheme();
  const [currentBill, setCurrentBill] = useState(bill);
  const [amountKeyboard, setAmountKeyboard] = useState(null); // 'amount' | 'nextAmount'
  const [hasNextAmount, setHasNextAmount] = useState(bill.nextAmount != null);
  const [date, setDate] = useState({
    m: getMonth(bill.firstMonth),
    y: getYear(bill.firstMonth),
  });
  console.log(date);

  const [fields, setFields] = useState({ name: ['label', 'emoji', 'amount', 'order', 'type'], label: ['Nombre', 'Emoji', 'Monto', 'Orden', 'Tipo'] });

  useEffect(() => {
    console.log();
    if (bill.inMonths > 0) {
      setFields((prev) => {
        if (prev.name.includes('inMonths')) return prev;

        return {
          name: [...prev.name, 'inMonths', 'firstMonth'],
          label: [...prev.label, 'Cuotas', 'Primera cuota'],
        };
      });
    }
  }, [bill]);
  useEffect(() => {
    console.log(currentBill);
  }, [currentBill]);

  // el menú estorba en el modal, se esconde mientras está abierto
  useEffect(() => {
    if (!setShowMenu) return;
    setShowMenu(false);
    return () => setShowMenu(true);
  }, []);

  const confirmationAction = () => {
    if (Platform.OS === 'web') {
      const ok = window.confirm('¿Estas seguro que quieres eliminar este gasto?');
      if (ok) {
        deleteBill({ bill: currentBill });
        onCancel();
      }
    } else {
      Alert.alert('Eliminar gasto', '¿Estas seguro que quieres eliminar este gasto?', [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', onPress: () => (deleteBill({ bill: currentBill }), onCancel()) },
      ]);
    }
  };

  // "mes 2": monto solo para el mes siguiente al proyectado, no aplica en cuotas
  const inInstallments = fields.name.includes('inMonths');
  const canHaveNextAmount = !inInstallments;

  // la fila de mes 2 crece/achica en alto y el cuadro la sigue, el contenido entra con fade
  const nextAmountRowHeight = windowWidth * 0.12 + 1;
  const nextAmountProgress = useSharedValue(bill.nextAmount != null ? 1 : 0);

  useEffect(() => {
    nextAmountProgress.value = withTiming(hasNextAmount ? 1 : 0, { duration: 250, easing: Easing.out(Easing.quad) });
  }, [hasNextAmount]);

  const nextAmountRowStyle = useAnimatedStyle(() => ({
    height: nextAmountProgress.value * nextAmountRowHeight,
    overflow: 'hidden',
  }));

  const nextAmountContentStyle = useAnimatedStyle(() => ({
    opacity: nextAmountProgress.value,
  }));

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
      setAmountKeyboard(null);
    },
    onBlur: () => {
      focusState.current = { focused: false, blurredAt: Date.now() };
      setInputFocused(false);
    },
  };

  // hay teclado en pantalla, sea el custom o el del sistema
  const keyboardOpen = !!amountKeyboard || inputFocused;

  const closeKeyboards = () => {
    clearTimeout(openTimer.current);
    setAmountKeyboard(null);
    if (Platform.OS === 'web') document.activeElement?.blur?.();
    else Keyboard.dismiss();
  };

  const systemKeyboardOpen = () => {
    if (Platform.OS !== 'web') return Keyboard.isVisible();
    const { focused, blurredAt } = focusState.current;
    return focused || Date.now() - blurredAt < 400;
  };

  useEffect(() => () => clearTimeout(openTimer.current), []);

  const openKeyboard = (field) => {
    clearTimeout(openTimer.current);

    const wasOpen = systemKeyboardOpen();

    if (Platform.OS === 'web') document.activeElement?.blur?.();
    else Keyboard.dismiss();

    // el teclado nativo tarda en cerrarse, si montamos el custom antes queda mal puesto
    if (wasOpen) openTimer.current = setTimeout(() => setAmountKeyboard(field), 400);
    else setAmountKeyboard(field);
  };

  const addNextAmount = () => {
    setHasNextAmount(true);
    setCurrentBill((prev) => ({ ...prev, nextAmount: prev.nextAmount ?? 0 }));
    openKeyboard('nextAmount');
  };

  const removeNextAmount = () => {
    setHasNextAmount(false);
    if (amountKeyboard === 'nextAmount') setAmountKeyboard(null);
    setCurrentBill((prev) => {
      const { nextAmount, ...rest } = prev;
      // si el gasto guardado ya tenía mes 2, se marca en null para borrarlo en firestore
      return bill.nextAmount != null ? { ...rest, nextAmount: null } : rest;
    });
  };

  const Wrap = Platform.OS === 'web' ? View : Pressable;
  const wrapProps = Platform.OS === 'web' ? {} : { onPress: Keyboard.dismiss };

  return (
    <Animated.View entering={FadeInDown} style={[{ position: 'absolute', width: windowWidth, height: windowHeight, top: 0, left: 0 }]}>
      {/* con el teclado abierto, un toque fuera del modal solo lo cierra. Va detrás del
          contenido, así lo de adentro del modal sigue funcionando normal */}
      {keyboardOpen && <Pressable onPress={closeKeyboards} style={{ position: 'absolute', top: 0, left: 0, width: windowWidth, height: windowHeight }} />}

      <Wrap {...wrapProps} pointerEvents={keyboardOpen ? 'box-none' : 'auto'}>
        <Animated.View layout={LinearTransition} entering={FadeInDown} pointerEvents={keyboardOpen ? 'box-none' : 'auto'} style={[{ width: windowWidth, height: windowHeight * 0.6, justifyContent: 'center', alignItems: 'center' }]}>
          {/* <BlurView intensity={30} style={{ width: windowWidth * 0.8, borderRadius: 20, overflow: 'hidden' }}> */}
          <Animated.View layout={LinearTransition} style={{ width: windowWidth * 0.8, borderRadius: 20, overflow: 'hidden' }}>
            {fields.name.map((field, index) => {
              const rField = currentBill[field] ? (currentBill[field] === 'fixed' ? 'Gasto fijo' : currentBill[field] === 'planned' ? 'Gasto planeado' : String(currentBill[field])) : '';
              const isNumber = ['amount', 'order', 'inMonths'].includes(field);
              return (
                <Animated.View
                  key={field}
                  // el monto no cambia de posición y su fila de mes 2 anima su propio alto,
                  // el layout acá le competiría a esa animación
                  layout={field === 'amount' ? undefined : LinearTransition}
                  entering={FadeIn.duration(300)} // Entrada suave
                  exiting={FadeOut.duration(300)}
                >
                  {index > 0 && <View style={{ width: '100%', height: 1, backgroundColor: theme.bg.tr_3 }}></View>}
                  <View style={{ justifyContent: 'center', alignItems: 'center', height: windowWidth * 0.12, backgroundColor: theme.bg.tr_1, justifyContent: 'flex-start', flexDirection: 'row' }}>
                    <View style={{ backgroundColor: theme.bg.tr_1, height: '100%', justifyContent: 'center', paddingLeft: 15, paddingRight: 10, width: '25%' }}>
                      <Text style={{ color: theme.text._2, fontSize: fS.modalTransfer }}>{`${fields.label[index]}:`}</Text>
                    </View>
                    {field === 'type' ? (
                      <Pressable
                        style={{ flex: 1, height: '100%', justifyContent: 'center' }}
                        onPress={() =>
                          setCurrentBill((prev) => ({
                            ...prev,
                            type: prev.type === 'fixed' ? 'planned' : 'fixed',
                          }))
                        }
                      >
                        <Text style={{ color: theme.text._1, fontSize: fS.modalTransfer, paddingLeft: 10 }}>{rField}</Text>
                      </Pressable>
                    ) : field === 'amount' ? (
                      <>
                        <Pressable style={{ flex: 1, height: '100%', justifyContent: 'center' }} onPress={() => openKeyboard('amount')}>
                          <Text style={{ color: theme.text._1, fontSize: fS.modalTransfer, paddingLeft: 10 }}>{rField}</Text>
                        </Pressable>
                        {canHaveNextAmount && !hasNextAmount && (
                          <Pressable
                            onPress={() => addNextAmount()}
                            style={{
                              backgroundColor: theme.bg.tr_2,
                              borderRadius: 100,
                              height: windowWidth * 0.07,
                              width: windowWidth * 0.07,
                              justifyContent: 'center',
                              alignItems: 'center',
                              alignSelf: 'center',
                              marginRight: 10,
                            }}
                          >
                            <Image style={{ height: windowWidth * 0.035, aspectRatio: 1 / 1, opacity: 0.9, transform: [{ rotate: '45deg' }] }} source={require('../../assets/icons/x.png')}></Image>
                          </Pressable>
                        )}
                      </>
                    ) : field === 'firstMonth' ? (
                      <View style={{ flexDirection: 'row', height: '100%', flex: 1 }}>
                        <View style={{ flexDirection: 'row', height: '100%', alignItems: 'center', flex: 1 }}>
                          <Text style={{ color: theme.text._3, fontSize: fS.modalTransfer, paddingLeft: 10 }}>Mes:</Text>
                          <TextInput
                            {...inputFocusProps}
                            style={{ color: theme.text._1, fontSize: fS.modalTransfer, height: '100%', paddingLeft: 10, flex: 1 }}
                            value={date.m}
                            keyboardType={'numeric'}
                            keyboardAppearance='dark'
                            onChangeText={(text) =>
                              setDate((prev) => ({
                                ...prev,
                                m: text,
                              }))
                            }
                          ></TextInput>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                          <Text style={{ color: theme.text._3, fontSize: fS.modalTransfer }}>Año:</Text>
                          <TextInput
                            {...inputFocusProps}
                            style={{ color: theme.text._1, fontSize: fS.modalTransfer, height: '100%', paddingHorizontal: 10, flex: 1 }}
                            value={date.y}
                            keyboardType={'numeric'}
                            keyboardAppearance='dark'
                            onChangeText={(text) =>
                              setDate((prev) => ({
                                ...prev,
                                y: text,
                              }))
                            }
                          ></TextInput>
                        </View>
                      </View>
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

                  {/* fila mes 2 ------------------------------------ */}

                  {field === 'amount' && canHaveNextAmount && (
                    <Animated.View pointerEvents={hasNextAmount ? 'auto' : 'none'} style={nextAmountRowStyle}>
                      <View style={{ width: '100%', height: 1, backgroundColor: theme.bg.tr_3 }}></View>
                      <Animated.View style={[{ alignItems: 'center', height: windowWidth * 0.12, backgroundColor: theme.bg.tr_1, justifyContent: 'flex-start', flexDirection: 'row' }, nextAmountContentStyle]}>
                        <View style={{ backgroundColor: theme.bg.tr_1, height: '100%', justifyContent: 'center', paddingLeft: 15, paddingRight: 10, width: '25%' }}>
                          <Text style={{ color: theme.text._2, fontSize: fS.modalTransfer }}>Mes 2:</Text>
                        </View>
                        <Pressable style={{ flex: 1, height: '100%', justifyContent: 'center' }} onPress={() => openKeyboard('nextAmount')}>
                          <Text style={{ color: theme.text._1, fontSize: fS.modalTransfer, paddingLeft: 10 }}>{currentBill.nextAmount ? String(currentBill.nextAmount) : ''}</Text>
                        </Pressable>
                        <Pressable
                          onPress={() => removeNextAmount()}
                          style={{
                            backgroundColor: theme.bg.tr_2,
                            borderRadius: 100,
                            height: windowWidth * 0.07,
                            width: windowWidth * 0.07,
                            justifyContent: 'center',
                            alignItems: 'center',
                            alignSelf: 'center',
                            marginRight: 10,
                          }}
                        >
                          <Image style={{ height: windowWidth * 0.035, aspectRatio: 1 / 1, opacity: 0.9 }} source={require('../../assets/icons/x.png')}></Image>
                        </Pressable>
                      </Animated.View>
                    </Animated.View>
                  )}
                </Animated.View>
              );
            })}
          </Animated.View>
          {/* </BlurView> */}

          {/* los botones quedan fuera del modal: con el teclado abierto no reciben el
              toque, se lo lleva el escudo de atrás y solo cierra el teclado */}
          <Animated.View layout={LinearTransition} pointerEvents={keyboardOpen ? 'none' : 'auto'} style={{ marginRight: windowWidth * 0.2, marginTop: 10, flexDirection: 'row', justifyContent: 'flex-end', width: '100%', gap: 8 }}>
            {/* botón eliminar -------------------------- */}
            <Animated.View layout={LinearTransition}>
              <Pressable onPress={() => confirmationAction()} style={{ backgroundColor: theme.bg.red, borderRadius: 100, height: windowWidth * 0.08, width: windowWidth * 0.1, justifyContent: 'center', alignItems: 'center' }}>
                <Image style={{ height: windowWidth * 0.055, aspectRatio: 1 / 1, opacity: 0.9 }} source={require('../../assets/icons/trash.png')}></Image>
              </Pressable>
            </Animated.View>

            {/* botón cuotas -------------------------- */}

            {currentBill.type === 'planned' && (
              <Animated.View layout={LinearTransition} entering={SlideInRight} exiting={SlideOutRight}>
                <Pressable
                  onPress={() =>
                    setFields((prev) => {
                      if (prev.name.includes('inMonths')) {
                        setDate({ m: '', y: '' });
                        setCurrentBill((prev2) => ({ ...prev2, inMonths: 0 }));

                        return {
                          name: prev.name.filter((f) => f !== 'inMonths' && f !== 'firstMonth'),
                          label: prev.label.filter((l) => l !== 'Cuotas' && l !== 'Primera cuota'),
                        };
                      } else {
                        setDate({ m: getNextMonth(), y: getYearOfNextMonth() });
                        // un gasto en cuotas no lleva monto de mes 2
                        removeNextAmount();

                        return {
                          name: [...prev.name, 'inMonths', 'firstMonth'],
                          label: [...prev.label, 'Cuotas', 'Primera cuota'],
                        };
                      }
                    })
                  }
                  style={{ backgroundColor: theme.bg.tr_2, borderRadius: 100, height: windowWidth * 0.08, justifyContent: 'center', alignItems: 'center' }}
                >
                  <Text style={{ color: theme.text._1, fontSize: fS.modalTransfer, paddingHorizontal: 20 }}>Cuotas</Text>
                </Pressable>
              </Animated.View>
            )}
            {/* botón cancelar -------------------------- */}

            <Animated.View layout={LinearTransition}>
              <Pressable onPress={() => onCancel()} style={{ backgroundColor: theme.bg.tr_2, borderRadius: 100, height: windowWidth * 0.08, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ color: theme.text._1, fontSize: fS.modalTransfer, paddingHorizontal: 20 }}>Cancelar</Text>
              </Pressable>
            </Animated.View>
            {/* botón confirmar -------------------------- */}

            {(JSON.stringify(currentBill) !== JSON.stringify(bills.find((b) => b.id === currentBill.id)) || getMonth(bill.firstMonth) !== date.m || getYear(bill.firstMonth) !== date.y) &&
              fields.name.every((field) => (field === 'firstMonth' ? currentBill.firstMonth !== '' && currentBill.firstMonth !== null : currentBill[field] !== '' && currentBill[field] !== 0 && currentBill[field] !== undefined && currentBill[field] !== null)) &&
              ('firstMonth' in currentBill ? currentBill.firstMonth !== '' : true) &&
              (hasNextAmount ? currentBill.nextAmount > 0 : true) && (
                <Animated.View layout={LinearTransition} entering={SlideInRight} exiting={SlideOutRight}>
                  <Pressable
                    onPress={() => (
                      updateBill({
                        bill: {
                          ...currentBill,
                          ...(currentBill.inMonths ? { firstMonth: createTimestamp(date.m, date.y) } : {}),
                        },
                      }),
                      onCancel()
                    )}
                    style={{ backgroundColor: theme.bg.green, borderRadius: 100, height: windowWidth * 0.08, justifyContent: 'center', alignItems: 'center' }}
                  >
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
          key={amountKeyboard}
          initialValue={currentBill[amountKeyboard] ? String(currentBill[amountKeyboard]) : '0'}
          onChange={(nextValue) => setCurrentBill((prev) => ({ ...prev, [amountKeyboard]: Number(nextValue) }))}
          onConfirm={(nextValue) => {
            setCurrentBill((prev) => ({ ...prev, [amountKeyboard]: Number(nextValue) }));
            setAmountKeyboard(null);
          }}
        />
      )}
    </Animated.View>
  );
}
