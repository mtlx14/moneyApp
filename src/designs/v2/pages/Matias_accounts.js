import { View, Text, Dimensions, Platform, TextInput, Pressable, ScrollView, Easing } from 'react-native';
import { useTheme } from '../../../theme/useTheme.js';
import { useData } from '../../../../context.js';
import { useEffect, useRef, useState } from 'react';
import Animated, { FadeIn, FadeOut, SlideInRight, SlideOutRight, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import AccountCard from '../components/AccountCard.js';
import { Keyboard } from '../components/Keyboard.js';

import AnimatedSwapTextS from '../components/AnimatedSwapTextS.js';
import { updateAccountBalance, updateChanges } from '../../../services.js';
import AccountHistory from '../components/AccountHistory.js';
import ModalTransaction from '../components/ModalTransaction.js';
import { fS } from '../../../theme/theme.js';
import GoBackScroll from '../components/GoBackScroll.js';
import { useAppStorage } from '../../../../appStorageProvider.js';
import { CONTENT_LEFT } from '../layout.js';
import { rideBreakdown } from '../../../helpers.js';

const windowHeight = Dimensions.get('window').height;
const windowWidth = Dimensions.get('window').width;

export default function Matias_accounts({ setShowMenu, navigate, nAnimations, params }) {
  const theme = useTheme();
  const { accounts, balances, transactions, categories } = useData();
  const { currentUser } = useAppStorage();

  const [localInfo, setLocalInfo] = useState({
    activeField: null,
    activeFieldAmount: null,
    selectedTx: null,
  });

  useEffect(() => {
    if (localInfo.activeField) setShowMenu(false);
    else setShowMenu(true);
  }, [localInfo.activeField]);

  // Se puede llegar acá desde el resumen del mes con el movimiento de un pago ya
  // armado: se abre su cuenta y el modal encima, igual que si se hubiera anotado
  // a mano desde el historial. El ref evita que se vuelva a abrir al cerrarlo
  const openedParams = useRef(null);
  useEffect(() => {
    if (!params?.newTx || openedParams.current === params || !accounts.length) return;
    const account = accounts.find((a) => a.id === params.newTx.accountId);
    if (!account) return;
    openedParams.current = params;
    setLocalInfo((prev) => ({
      ...prev,
      activeField: account,
      activeFieldAmount: balances.byAccount[account.id] || 0,
      selectedTx: params.newTx,
    }));
  }, [params, accounts]);


  // el listado no anima al entrar a la página, solo al volver de una cuenta
  const cameFromAccount = useRef(false);

  const handleOnPressAccount = ({ account }) => {
    cameFromAccount.current = true;
    setLocalInfo((prev) => ({
      ...prev,
      activeField: account,
      activeFieldAmount: balances.byAccount[account.id] || 0,
    }));
  };

  // las cuentas migradas al ledger muestran sus movimientos en vez del teclado:
  // ahí el saldo ya no se escribe a mano, sale de las transacciones. Por eso el
  // monto de la tarjeta lo lee de balances y no del estado local, que se copia
  // al abrir la cuenta y se quedaba viejo al anotar o borrar un movimiento
  const showHistory = !!localInfo.activeField?.isLedger;

  const closeField = () =>
    setLocalInfo((prev) => ({
      ...prev,
      activeField: null,
      activeFieldAmount: null,
      selectedTx: null,
    }));

  // el gesto de volver primero deshace el paso de adentro: el detalle de un
  // movimiento vuelve a la lista, y la cuenta abierta vuelve al listado. Solo
  // desde el listado se sale de la página
  const handleGoBack = () => {
    if (localInfo.selectedTx) {
      setLocalInfo((prev) => ({ ...prev, selectedTx: null }));
      return true;
    }
    if (localInfo.activeField) {
      closeField();
      return true;
    }
    return false;
  };

  return (
    <GoBackScroll entering={nAnimations.en} exiting={nAnimations.ex} navigate={navigate} onBack={handleGoBack} innerStep={!!localInfo.activeField}>
        <Animated.View style={[{ height: windowHeight * 1, width: windowWidth }]}>
          {/* la cuenta se va de una y el listado entra fundiéndose: es la única
              animación de la vuelta, así no hay dos cosas encimadas */}
          {!localInfo.activeField && (
            <Animated.View entering={cameFromAccount.current ? FadeIn.duration(180) : undefined}>
              <ScrollView style={Platform.OS === 'web' ? { height: windowHeight, width: windowWidth } : undefined}>
                <View style={{ width: windowWidth, height: windowHeight * 0.1, justifyContent: 'flex-end', alignItems: 'center' }}>
                  <Text style={{ color: theme.text._1, fontSize: fS.subsTitle, fontWeight: 400 }}>Cuentas Matías</Text>
                </View>
                <View
                  style={{
                    width: windowWidth,
                    paddingHorizontal: windowWidth * 0.05,
                    paddingLeft: CONTENT_LEFT,
                    gap: 5,
                    marginTop: windowHeight * 0.025,
                    paddingBottom: windowHeight * 0.015,
                  }}
                >
                  <Text style={{ color: theme.text._3, padding: 5, opacity: 0, fontSize: fS.mSummarySubtitle }}>a</Text>

                  {accounts
                    .filter((b) => b.type === 'm_account')
                    .sort((a, b) => a.order - b.order)
                    .map((account) => {
                      const rideRows = rideBreakdown({ account, transactions, categories });

                      return (
                        <View key={account.name} style={{ width: '100%', backgroundColor: theme.bg.account, borderRadius: 10 }}>
                          <Pressable onPress={() => handleOnPressAccount({ account })} style={{ width: '100%', height: windowWidth * 0.12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 15 }}>
                            <View style={{ flexDirection: 'row', gap: 10 }}>
                              <Text
                                style={{
                                  fontSize: fS.subsText,
                                }}
                              >
                                {account.emoji}
                              </Text>

                              <Text
                                style={{
                                  fontSize: fS.subsText,
                                  color: theme.text._2,
                                }}
                              >
                                {account.name}
                              </Text>
                            </View>

                            <AnimatedSwapTextS type={account.isNegative && 'debt'} value={balances.m_account[account.id].balance} />
                          </Pressable>
                          {/* lo que puso cada app dentro de la cuenta: la suma de sus
                              movimientos por categoría, donde antes iban las sub-cuentas.
                              No se toca —los montos se anotan abriendo la cuenta— y sin
                              movimientos no aparece nada */}
                          {rideRows.length > 0 && (
                            <View style={{ backgroundColor: theme.bg.subAccount, borderRadius: 10, marginHorizontal: 10, marginBottom: 10 }}>
                              {rideRows.map(({ id, category, total, lastTx }, index) => {
                                return (
                                  // tocarla abre el movimiento más nuevo de esa app: cerrarlo
                                  // deja la cuenta abierta con toda su lista
                                  <Pressable onPress={() => setLocalInfo((prev) => ({ ...prev, activeField: account, activeFieldAmount: balances.byAccount[account.id] || 0, selectedTx: lastTx }))} key={id} style={{ height: windowWidth * 0.1, justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 15 }}>
                                    {index > 0 && <View style={{ width: '94%', marginLeft: '3%', height: 1, backgroundColor: theme.bg.tr_1 }}></View>}
                                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', height: '100%' }}>
                                      <View style={{ flexDirection: 'row', gap: 10 }}>
                                        <Text
                                          style={{
                                            fontSize: fS.subsText,
                                          }}
                                        >
                                          {category.emoji}
                                        </Text>
                                        <Text
                                          style={{
                                            color: theme.text._3,
                                            fontSize: fS.subsText,
                                          }}
                                        >
                                          {category.label}
                                        </Text>
                                      </View>
                                      <Text
                                        style={{
                                          color: theme.text._3,
                                        }}
                                      >
                                        <AnimatedSwapTextS value={total} />
                                      </Text>
                                    </View>
                                  </Pressable>
                                );
                              })}
                            </View>
                          )}
                        </View>
                      );
                    })}
                </View>
                <View style={{ paddingHorizontal: 20, paddingVertical: 10, marginRight: 20, backgroundColor: theme.bg.tr_05, borderRadius: 10, alignSelf: 'flex-end' }}>
                  <Text
                    style={{
                      color: theme.text._2,
                      fontWeight: 500,
                      fontSize: fS.subsText,
                    }}
                  >
                    {`Total:  $${balances.matiasTotal.toLocaleString('es-CL')}`}
                  </Text>
                </View>
                <View style={{ width: 100, height: windowHeight * 0.3 }}></View>
              </ScrollView>
            </Animated.View>
          )}
          {/* modals ------------------------------------ */}
          {localInfo.activeField && !localInfo.selectedTx && <AccountCard amountValue={showHistory ? balances.byAccount[localInfo.activeField.id] || 0 : localInfo.activeFieldAmount} account={localInfo.activeField} wide={showHistory} />}
          {showHistory && !localInfo.selectedTx && <AccountHistory account={localInfo.activeField} onSelect={(tx) => setLocalInfo((prev) => ({ ...prev, selectedTx: tx }))} onNew={(type) => setLocalInfo((prev) => ({ ...prev, selectedTx: { accountId: prev.activeField.id, type, amount: 0, label: '', date: new Date() } }))} />}
          {localInfo.selectedTx && <ModalTransaction tx={localInfo.selectedTx} onCancel={() => setLocalInfo((prev) => ({ ...prev, selectedTx: null }))} />}

          {/* teclado ------------------------------------ */}

          {/* las que no son ledger (Bencina, los sueldos) siguen con el saldo
              escrito a mano */}
          {localInfo.activeField && !showHistory && (
            <Keyboard
              initialValue={localInfo.activeFieldAmount}
              onChange={(nextValue) => {
                setLocalInfo((prev) => ({
                  ...prev,
                  activeFieldAmount: Number(nextValue),
                }));
              }}
              onConfirm={(nextValue) => {
                updateChanges({ user: currentUser.name, change: 'matias' });
                updateAccountBalance({ account: localInfo.activeField.id, balance: Number(nextValue) });

                setLocalInfo((prev) => ({
                  ...prev,
                  activeField: null,
                  activeFieldAmount: null,
                }));
              }}
            />
          )}
        </Animated.View>
    </GoBackScroll>
  );
}
