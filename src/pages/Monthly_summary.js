import { View, Text, Dimensions, Platform, TextInput, Pressable, ScrollView, Easing } from 'react-native';
import { useTheme } from '../theme/useTheme.js';
import { useData } from '../../context.js';
import { useEffect, useRef, useState } from 'react';
import Animated, { FadeIn, FadeOut, runOnJS, SlideInRight, SlideOutRight, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import CheckButton from '../components/CheckButton.js';
import UnmarkButton from '../components/UnmarkButton.js';
import { fS } from '../theme/theme.js';
import { currentInstallment } from '../helpers.js';
import ModalEditAccount from '../components/ModalEditAccount.js';
import { Image } from 'expo-image';
import GoBackScroll from '../components/GoBackScroll.js';

const windowHeight = Dimensions.get('window').height;
const windowWidth = Dimensions.get('window').width;

export default function Monthly_summary({ setShowMenu, navigate, nAnimations }) {
  const theme = useTheme();
  const { balances, bills } = useData();
  const [activeField, setActiveField] = useState(null);

  return (
    <>
      <GoBackScroll navigate={navigate}>
        <Animated.View style={[{ height: windowHeight * 1.2, width: windowWidth }]} entering={nAnimations.en} exiting={nAnimations.ex}>
          {activeField ? (
            <ModalEditAccount bill={activeField} onCancel={() => setActiveField(null)} />
          ) : (
            <Animated.View entering={FadeIn} exiting={FadeOut}>
              <ScrollView>
                <View style={{ width: windowWidth, height: windowHeight * 0.1, justifyContent: 'flex-end', alignItems: 'center' }}>
                  <Text style={{ color: theme.text._1, fontSize: fS.subsTitle, fontWeight: 400 }}>Resumen del mes</Text>
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
                  <Text style={{ color: theme.text._3, padding: 5, fontSize: fS.mSummarySubtitle }}>Gastos fijos</Text>
                  {bills
                    .filter((b) => b.type === 'fixed' || b.type === 'subscriptions')
                    .sort((a, b) => a.order - b.order)
                    .map((bill) => {
                      return (
                        <Pressable
                          onPress={() => {
                            bill.type === 'subscriptions' ? navigate('subscriptions') : setActiveField(bill);
                          }}
                          key={bill.label}
                          style={{ width: '100%', backgroundColor: theme.bg.tr_05, borderRadius: 10, height: windowWidth * 0.12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 10 }}
                        >
                          <View style={{ flexDirection: 'row', gap: 10, paddingLeft: 5 }}>
                            <Text
                              style={{
                                fontSize: fS.subsText,
                              }}
                            >
                              {bill.emoji}
                            </Text>

                            <Text
                              style={{
                                color: theme.text._2,
                                fontSize: fS.subsText,
                              }}
                            >
                              {bill.label}
                            </Text>
                          </View>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 15 }}>
                            <Text
                              style={{
                                color: theme.text._2,
                                fontSize: fS.subsText,
                              }}
                            >
                              {`$${(bill.type === 'fixed' ? bill.amount : balances.billsBalances.subscriptions.toPay).toLocaleString('es-CL')}`}
                            </Text>
                            <CheckButton bill={bill} />
                          </View>
                        </Pressable>
                      );
                    })}

                  <Text style={{ color: theme.text._3, padding: 5, fontSize: fS.mSummarySubtitle }}>Gastos planeados</Text>
                  {bills
                    .filter((b) => b.type === 'planned')
                    .sort((a, b) => a.order - b.order)
                    .map((bill) => {
                      return (
                        <Pressable onPress={() => setActiveField(bill)} key={bill.label} style={{ width: '100%', backgroundColor: theme.bg.tr_05, borderRadius: 10, height: windowWidth * 0.12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 10 }}>
                          <View style={{ flexDirection: 'row', gap: 10, paddingLeft: 5 }}>
                            <Text
                              style={{
                                fontSize: fS.subsText,
                              }}
                            >
                              {bill.emoji}
                            </Text>

                            <Text
                              style={{
                                color: theme.text._2,
                                fontSize: fS.subsText,
                              }}
                            >
                              {`${bill.label} ${bill.inMonths > 0 ? currentInstallment(bill.firstMonth) + '/' + bill.inMonths : ''}`}
                            </Text>
                          </View>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 15 }}>
                            <Text
                              style={{
                                color: theme.text._2,
                                fontSize: fS.subsText,
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
                  <UnmarkButton billToUpdate={'monthly_summary'} />
                  <Pressable onPress={() => setActiveField({})} style={{ backgroundColor: theme.bg.tr_1, borderRadius: 100, height: windowWidth * 0.09, width: windowWidth * 0.1, justifyContent: 'center', alignItems: 'center' }}>
                    <Image style={{ height: windowWidth * 0.045, aspectRatio: 1 / 1, opacity: 0.9, transform: [{ rotate: '45deg' }] }} source={require('../../assets/icons/x.png')}></Image>
                  </Pressable>
                </View>
                <View style={{ width: 100, height: windowHeight * 0.3 }}></View>
              </ScrollView>
            </Animated.View>
          )}
        </Animated.View>
      </GoBackScroll>
    </>
  );
}
