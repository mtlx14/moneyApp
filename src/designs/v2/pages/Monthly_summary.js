import { View, Text, Dimensions, Platform, TextInput, Pressable, ScrollView, Easing } from 'react-native';
import { useTheme } from '../../../theme/useTheme.js';
import { useData } from '../../../../context.js';
import { useAppStorage } from '../../../../appStorageProvider.js';
import { useEffect, useRef, useState } from 'react';
import Animated, { FadeIn, FadeInDown, FadeOut, runOnJS, SlideInRight, SlideOutRight, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import CheckButton from '../components/CheckButton.js';
import UnmarkButton from '../components/UnmarkButton.js';
import { fS } from '../../../theme/theme.js';
import { billToPay, cardMonth, currentInstallment, isWeekly } from '../../../helpers.js';
import ModalEditAccount from '../components/ModalEditAccount.js';
import ModalCard from '../components/ModalCard.js';
import ModalWeeks from '../components/ModalWeeks.js';
import Icon from '../components/Icon.js';
import { saveCard } from '../../../services.js';
import { Image } from 'expo-image';
import GoBackScroll from '../components/GoBackScroll.js';
import { CONTENT_LEFT } from '../layout.js';

const windowHeight = Dimensions.get('window').height;
const windowWidth = Dimensions.get('window').width;

export default function Monthly_summary({ setShowMenu, navigate, nAnimations }) {
  const theme = useTheme();
  const { balances, bills, cards, cardPurchases } = useData();
  const { monthOffset } = useAppStorage();
  const [activeField, setActiveField] = useState(null);
  // la tarjeta nueva que se está armando en su modal; las que ya existen se
  // editan desde adentro de cada una
  const [newCard, setNewCard] = useState(null);
  // el gasto semanal cuyas semanas se están marcando
  const [weeksBillId, setWeeksBillId] = useState(null);

  // la lista solo anima al volver del modal, no al entrar a la página
  const cameFromModal = useRef(false);
  const openModal = (field) => {
    cameFromModal.current = true;
    setActiveField(field);
  };
  const openNewCard = () => {
    cameFromModal.current = true;
    setNewCard({ name: '', order: cards.length });
  };

  // el modal de la tarjeta nueva se come el gesto de volver: primero cierra
  const handleGoBack = () => {
    if (weeksBillId) {
      setWeeksBillId(null);
      return true;
    }
    if (newCard) {
      setNewCard(null);
      return true;
    }
    return false;
  };

  return (
    <GoBackScroll entering={nAnimations.en} exiting={nAnimations.ex} navigate={navigate} onBack={handleGoBack} innerStep={!!newCard || !!weeksBillId}>
        <Animated.View style={[{ height: windowHeight * 1.2, width: windowWidth }]}>
          {activeField ? (
            <ModalEditAccount bill={activeField} onCancel={() => setActiveField(null)} setShowMenu={setShowMenu} />
          ) : newCard ? (
            <ModalCard
              card={newCard}
              setShowMenu={setShowMenu}
              onCancel={() => setNewCard(null)}
              onSave={(card) => {
                saveCard({ card });
                setNewCard(null);
              }}
            />
          ) : (
            // dos FadeInDown anidados igual que el modal: el recorrido se suma y las
            // opacidades se multiplican, con uno solo la entrada no coincide
            <Animated.View entering={cameFromModal.current ? FadeInDown : undefined}>
              <Animated.View entering={cameFromModal.current ? FadeInDown : undefined}>
                <ScrollView style={Platform.OS === 'web' ? { height: windowHeight, width: windowWidth } : undefined}>
                <View style={{ width: windowWidth, height: windowHeight * 0.1, justifyContent: 'flex-end', alignItems: 'center' }}>
                  <Text style={{ color: theme.text._1, fontSize: fS.subsTitle, fontWeight: 400 }}>Resumen del mes</Text>
                </View>
                <View
                  style={{
                    width: windowWidth,
                    paddingHorizontal: windowWidth * 0.05,
                    paddingLeft: CONTENT_LEFT,
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
                            bill.type === 'subscriptions' ? navigate('subscriptions') : openModal(bill);
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
                              {`$${(bill.type === 'fixed' ? (isWeekly(bill) ? billToPay(bill, monthOffset) : bill.amount) : balances.billsBalances.subscriptions.toPay).toLocaleString('es-CL')}`}
                            </Text>
                            <CheckButton bill={bill} onPress={(b) => setWeeksBillId(b.id)} />
                          </View>
                        </Pressable>
                      );
                    })}

                  {/* Las tarjetas de crédito, con lo que suman las cuotas del mes
                      que se mira. Van antes que los planeados */}
                  <Text style={{ color: theme.text._3, padding: 5, fontSize: fS.mSummarySubtitle }}>Tarjetas</Text>
                  {[...cards]
                    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                    .map((card) => {
                      const { total } = cardMonth({ card, purchases: cardPurchases, monthOffset });

                      return (
                        <Pressable
                          key={card.id}
                          onPress={() => navigate('credit_card', 1, { cardId: card.id })}
                          style={{ width: '100%', backgroundColor: theme.bg.tr_05, borderRadius: 10, height: windowWidth * 0.12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 10 }}
                        >
                          <View style={{ flexDirection: 'row', gap: 10, paddingLeft: 5 }}>
                            <Text style={{ fontSize: fS.subsText }}>{card.emoji || '💳'}</Text>
                            <Text style={{ color: theme.text._2, fontSize: fS.subsText }}>{card.name}</Text>
                          </View>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 15 }}>
                            <Text style={{ color: theme.text._2, fontSize: fS.subsText }}>{`$${total.toLocaleString('es-CL')}`}</Text>
                            <CheckButton bill={card} collectionName='cards' />
                          </View>
                        </Pressable>
                      );
                    })}
                  {/* agregar: la misma fila, más apagada y con el más en lugar del monto */}
                  <Pressable onPress={openNewCard} style={{ width: '100%', backgroundColor: theme.bg.tr_05, opacity: 0.6, borderRadius: 10, height: windowWidth * 0.12, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 15 }}>
                    <Icon name='add' size={windowWidth * 0.05} color={theme.text._2} />
                    <Text style={{ color: theme.text._2, fontSize: fS.subsText }}>Nueva tarjeta</Text>
                  </Pressable>

                  <Text style={{ color: theme.text._3, padding: 5, fontSize: fS.mSummarySubtitle }}>Gastos planeados</Text>
                  {bills
                    .filter((b) => b.type === 'planned')
                    .sort((a, b) => a.order - b.order)
                    .map((bill) => {
                      return (
                        <Pressable onPress={() => openModal(bill)} key={bill.label} style={{ width: '100%', backgroundColor: theme.bg.tr_05, borderRadius: 10, height: windowWidth * 0.12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 10 }}>
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
                              {`${bill.label} ${bill.inMonths > 0 ? currentInstallment(bill.firstMonth, monthOffset) + '/' + bill.inMonths : ''}`}
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
                <View style={{ flexDirection: 'row', marginLeft: CONTENT_LEFT, gap: 8 }}>
                  <UnmarkButton billToUpdate={'monthly_summary'} />
                  <Pressable onPress={() => openModal({})} style={{ backgroundColor: theme.bg.tr_1, borderRadius: 100, height: windowWidth * 0.09, width: windowWidth * 0.09, justifyContent: 'center', alignItems: 'center' }}>
                    <Image style={{ height: windowWidth * 0.045, aspectRatio: 1 / 1, opacity: 0.9, transform: [{ rotate: '45deg' }] }} source={require('../../../../assets/icons/x.png')}></Image>
                  </Pressable>
                </View>
                {/* aire al final del scroll; era 0.3 para esquivar el botón flotante del menú viejo */}
                <View style={{ width: 100, height: windowHeight * 0.05 }}></View>
                </ScrollView>
              </Animated.View>
            </Animated.View>
          )}

          {/* las semanas de un gasto fijo semanal, cada una con su check */}
          {weeksBillId && <ModalWeeks billId={weeksBillId} onClose={() => setWeeksBillId(null)} setShowMenu={setShowMenu} />}
        </Animated.View>
    </GoBackScroll>
  );
}
