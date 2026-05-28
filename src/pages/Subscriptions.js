import { View, Text, Dimensions, Platform, TextInput, Pressable, ScrollView, Easing } from 'react-native';
import { useTheme } from '../theme/useTheme.js';
import { useData } from '../../context.js';
import { useEffect, useRef, useState } from 'react';
import Animated, { FadeIn, FadeOut, SlideInRight, SlideOutRight, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import CheckButton from '../components/CheckButton.js';
import UnmarkButton from '../components/UnmarkButton.js';
import { fS } from '../theme/theme.js';
import { Image } from 'expo-image';
import ModalEditAccount from '../components/ModalEditAccount.js';
import ModalEditSub from '../components/ModalEditSub.js';
import GoBackScroll from '../components/GoBackScroll.js';

const windowHeight = Dimensions.get('window').height;
const windowWidth = Dimensions.get('window').width;

function currentInstallment(firstMonth) {
  const now = new Date();
  const first = firstMonth.toDate();
  const yearDiff = now.getFullYear() - first.getFullYear();
  const monthDiff = now.getMonth() - first.getMonth();

  return yearDiff * 12 + monthDiff + 1;
}

export default function Subscriptions({ setShowMenu, navigate, nAnimations }) {
  const theme = useTheme();
  const { bills } = useData();
  const [activeField, setActiveField] = useState(null);

  return (
    <>
      <GoBackScroll page='monthly_summary' navigate={navigate}>
        <Animated.View style={[{ height: windowHeight * 1.2, width: windowWidth }]} entering={nAnimations.en} exiting={nAnimations.ex}>
          {activeField ? (
            <ModalEditSub bill={activeField} onCancel={() => setActiveField(null)} />
          ) : (
            <View>
              <ScrollView style={Platform.OS === 'web' ? { height: windowHeight, width: windowWidth } : undefined}>
                <View style={{ width: windowWidth, height: windowHeight * 0.1, justifyContent: 'flex-end', alignItems: 'center' }}>
                  <Text style={{ color: theme.text._1, fontSize: fS.subsTitle * 1.2, fontWeight: 400 }}>Suscripciones</Text>
                </View>
                <View
                  style={{
                    width: windowWidth,
                    paddingHorizontal: windowWidth * 0.05,
                    gap: 5,
                    marginTop: windowHeight * 0.03,
                    paddingBottom: windowHeight * 0.015,
                  }}
                >
                  <Text style={{ color: theme.text._3, padding: 5, opacity: 0, fontSize: fS.mSummarySubtitle }}>Gastos fijos</Text>
                  {bills
                    .filter((b) => b.type === 'sub')
                    .sort((a, b) => a.payDay - b.payDay)
                    .map((bill) => {
                      return (
                        <Pressable onPress={() => setActiveField(bill)} key={bill.label} style={{ width: '100%', backgroundColor: theme.bg.tr_05, borderRadius: 10, height: windowWidth * 0.12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 10 }}>
                          <View style={{ flexDirection: 'row', gap: 5, paddingLeft: 0, alignItems: 'center' }}>
                            <View
                              style={{
                                height: windowWidth * 0.1 - 10,
                                aspectRatio: 1 / 1,
                                backgroundColor: theme.bg.tr_1,
                                borderRadius: 5,
                                justifyContent: 'center',
                                alignItems: 'center',
                                marginRight: 5,
                                //   backgroundColor: subColor[bill.label.replaceAll(' ', '_').replace('-', '_')],
                              }}
                            >
                              <Text style={{ color: theme.text._2, fontWeight: 600, fontSize: fS.subsPayDay }}>{bill.payDay}</Text>
                            </View>

                            <Text
                              style={{
                                color: theme.text._2,
                                fontSize: fS.subsText,
                              }}
                            >
                              {`${bill.emoji}  ${bill.label}`}
                            </Text>
                          </View>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 15 }}>
                            <Text
                              style={{
                                fontSize: fS.subsText,
                                color: theme.text._2,
                              }}
                            >
                              {`$${bill.amount.toLocaleString('es-CL')}`}
                            </Text>
                            <CheckButton bill={bill} />
                          </View>
                        </Pressable>
                      );
                    })}
                </View>
                <View style={{ flexDirection: 'row', marginLeft: windowWidth * 0.05, gap: 8 }}>
                  <UnmarkButton billToUpdate={'subs'} />
                  <Pressable onPress={() => setActiveField({})} style={{ backgroundColor: theme.bg.tr_1, borderRadius: 100, height: windowWidth * 0.09, width: windowWidth * 0.1, justifyContent: 'center', alignItems: 'center' }}>
                    <Image style={{ height: windowWidth * 0.045, aspectRatio: 1 / 1, opacity: 0.9, transform: [{ rotate: '45deg' }] }} source={require('../../assets/icons/x.png')}></Image>
                  </Pressable>
                </View>
                <View style={{ width: 100, height: windowHeight * 0.3 }}></View>
              </ScrollView>
            </View>
          )}
        </Animated.View>
      </GoBackScroll>
    </>
  );
}
