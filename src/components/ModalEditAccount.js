import { BlurView } from 'expo-blur';

import { Alert, Dimensions, Keyboard, Platform, Pressable, Text, TextInput, View } from 'react-native';
import { useTheme } from '../theme/useTheme';
import Animated, { useSharedValue, withDelay, withTiming, Easing, useAnimatedStyle, FadeInDown, LinearTransition, FadeInRight, FadeOutRight, SlideInRight, SlideOutRight, FadeOut, FadeIn } from 'react-native-reanimated';
import { useEffect, useState } from 'react';
import { fS } from '../theme/theme';
import { useData } from '../../context';
import { deleteBill, updateBill } from '../services';
import { Image } from 'expo-image';
import { createTimestamp, getMonth, getNextMonth, getYear, getYearOfNextMonth } from '../helpers';

export default function ModalEditAccount({ bill = {}, onCancel }) {
  const windowWidth = Dimensions.get('window').width;
  const windowHeight = Dimensions.get('window').height;
  const { bills } = useData();
  const theme = useTheme();
  const [currentBill, setCurrentBill] = useState(bill);
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
  const confirmationAction = () => {
    if (Platform.OS === 'web') {
      const ok = window.confirm('¿Estas seguro que quieres eliminar este gasto?');
      if (ok) {
        handleOnPress();
      }
    } else {
      Alert.alert('Eliminar gasto', '¿Estas seguro que quieres eliminar este gasto?', [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', onPress: () => (deleteBill({ bill: currentBill }), onCancel()) },
      ]);
    }
  };

  return (
    <Animated.View entering={FadeInDown} style={[{ position: 'absolute', width: windowWidth, height: windowHeight, top: 0, left: 0 }]}>
      <Pressable onPress={Keyboard.dismiss}>
        <Animated.View layout={LinearTransition} entering={FadeInDown} style={[{ width: windowWidth, height: windowHeight * 0.6, justifyContent: 'center', alignItems: 'center' }]}>
          {/* <BlurView intensity={30} style={{ width: windowWidth * 0.8, borderRadius: 20, overflow: 'hidden' }}> */}
          <Animated.View layout={LinearTransition} style={{ width: windowWidth * 0.8, borderRadius: 20, overflow: 'hidden' }}>
            {fields.name.map((field, index) => {
              const rField = currentBill[field] ? (currentBill[field] === 'fixed' ? 'Gasto fijo' : currentBill[field] === 'planned' ? 'Gasto planeado' : String(currentBill[field])) : '';
              const isNumber = ['amount', 'order', 'inMonths'].includes(field);
              return (
                <Animated.View
                  key={field}
                  layout={LinearTransition}
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
                        style={{ flex: 1 }}
                        onPress={() =>
                          setCurrentBill((prev) => ({
                            ...prev,
                            type: currentBill.type === 'fixed' ? 'planned' : 'fixed',
                          }))
                        }
                      >
                        <Text style={{ color: theme.text._1, fontSize: fS.modalTransfer, paddingLeft: 10 }}>{rField}</Text>
                      </Pressable>
                    ) : field === 'firstMonth' ? (
                      <View style={{ flexDirection: 'row', height: '100%' }}>
                        <View style={{ flexDirection: 'row', height: '100%', alignItems: 'center' }}>
                          <Text style={{ color: theme.text._3, fontSize: fS.modalTransfer, paddingLeft: 10 }}>Mes:</Text>
                          <TextInput
                            style={{ color: theme.text._1, fontSize: fS.modalTransfer, height: '100%', paddingLeft: 10, paddingRight: 20 }}
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
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <Text style={{ color: theme.text._3, fontSize: fS.modalTransfer }}>Año:</Text>
                          <TextInput
                            style={{ color: theme.text._1, fontSize: fS.modalTransfer, height: '100%', paddingHorizontal: 10 }}
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
                </Animated.View>
              );
            })}
          </Animated.View>
          {/* </BlurView> */}

          <Animated.View layout={LinearTransition} style={{ marginRight: windowWidth * 0.2, marginTop: 10, flexDirection: 'row', justifyContent: 'flex-end', width: '100%', gap: 8 }}>
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
              ('firstMonth' in currentBill ? currentBill.firstMonth !== '' : true) && (
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
      </Pressable>
    </Animated.View>
  );
}
