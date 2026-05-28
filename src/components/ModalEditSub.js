import { BlurView } from 'expo-blur';

import { Alert, Dimensions, Keyboard, Platform, Pressable, Text, TextInput, View } from 'react-native';
import { useTheme } from '../theme/useTheme';
import Animated, { useSharedValue, withDelay, withTiming, Easing, useAnimatedStyle, FadeInDown, LinearTransition, FadeInRight, FadeOutRight, SlideInRight, SlideOutRight } from 'react-native-reanimated';
import { useEffect, useState } from 'react';
import { fS } from '../theme/theme';
import { useData } from '../../context';
import { deleteBill, updateBill } from '../services';
import { Image } from 'expo-image';

export default function ModalEditSub({ bill = {}, onCancel }) {
  const windowWidth = Dimensions.get('window').width;
  const windowHeight = Dimensions.get('window').height;
  const { bills } = useData();
  const theme = useTheme();
  const [currentBill, setCurrentBill] = useState(bill);

  const fields = ['label', 'emoji', 'amount', 'payDay'];
  const fieldsLabels = ['Nombre', 'Emoji', 'Monto', 'Día de pago'];

  const confirmationAction = () => {
    if (Platform.OS === 'web') {
      const ok = window.confirm('¿Estas seguro que quieres eliminar esta suscripción?');
      if (ok) {
        handleOnPress();
      }
    } else {
      Alert.alert('Eliminar suscripción', '¿Estas seguro que quieres eliminar esta suscripción?', [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', onPress: () => (deleteBill({ bill: currentBill }), onCancel()) },
      ]);
    }
  };

  const Wrap = Platform.OS === 'web' ? View : Pressable;
  const wrapProps = Platform.OS === 'web' ? {} : { onPress: Keyboard.dismiss };

  return (
    <Animated.View entering={FadeInDown} style={[{ position: 'absolute', width: windowWidth, height: windowHeight, top: 0, left: 0 }]}>
      <Wrap {...wrapProps}>
        <Animated.View entering={FadeInDown} style={[{ width: windowWidth, height: windowHeight * 0.6, justifyContent: 'center', alignItems: 'center' }]}>
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
                  </View>
                </View>
              );
            })}
          </BlurView>
          <Animated.View layout={LinearTransition} style={{ marginRight: windowWidth * 0.2, marginTop: 10, flexDirection: 'row', justifyContent: 'flex-end', width: '100%', gap: 8 }}>
            <Animated.View layout={LinearTransition}>
              <Pressable onPress={() => confirmationAction()} style={{ backgroundColor: theme.bg.red, borderRadius: 100, height: windowWidth * 0.08, width: windowWidth * 0.1, justifyContent: 'center', alignItems: 'center' }}>
                <Image style={{ height: windowWidth * 0.055, aspectRatio: 1 / 1, opacity: 0.9 }} source={require('../../assets/icons/trash.png')}></Image>
              </Pressable>
            </Animated.View>
            <Animated.View layout={LinearTransition}>
              <Pressable onPress={() => onCancel()} style={{ backgroundColor: theme.bg.tr_2, borderRadius: 100, height: windowWidth * 0.08, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ color: theme.text._1, fontSize: fS.modalTransfer, paddingHorizontal: 20 }}>Cancelar</Text>
              </Pressable>
            </Animated.View>
            {JSON.stringify(currentBill) !== JSON.stringify(bills.find((b) => b.id === currentBill.id)) && fields.every((field) => field in currentBill) && (
              <Animated.View layout={LinearTransition} entering={SlideInRight} exiting={SlideOutRight}>
                <Pressable onPress={() => (updateBill({ bill: { ...currentBill, type: 'sub' } }), onCancel())} style={{ backgroundColor: theme.bg.green, borderRadius: 100, height: windowWidth * 0.08, justifyContent: 'center', alignItems: 'center' }}>
                  <Text style={{ color: theme.text._1, fontSize: fS.modalTransfer, paddingHorizontal: 20 }}>Guardar</Text>
                </Pressable>
              </Animated.View>
            )}
          </Animated.View>
        </Animated.View>
      </Wrap>
    </Animated.View>
  );
}
