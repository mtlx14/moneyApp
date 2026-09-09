import { View, Text, Dimensions, Platform, Pressable, ScrollView } from 'react-native';
import { useTheme } from '../../../theme/useTheme.js';
import { useData } from '../../../../context.js';
import { useEffect, useRef, useState } from 'react';
import Animated, { FadeIn } from 'react-native-reanimated';
import AccountCard from '../components/AccountCard.js';
import { Keyboard } from '../components/Keyboard.js';

import AnimatedSwapTextS from '../components/AnimatedSwapTextS.js';
import { updateAccountBalance, updateChanges, updateSubAccount } from '../../../services.js';
import ModalTransferAccount from '../components/ModalTransferAccount.js';
import AccountHistory from '../components/AccountHistory.js';
import ModalTransaction from '../components/ModalTransaction.js';
import { fS } from '../../../theme/theme.js';
import GoBackScroll from '../components/GoBackScroll.js';
import CollapsibleRow from '../components/CollapsibleRow.js';
import { useAppStorage } from '../../../../appStorageProvider.js';
import { CONTENT_LEFT } from '../layout.js';

const windowHeight = Dimensions.get('window').height;
const windowWidth = Dimensions.get('window').width;

export default function Aylin_accounts({ setShowMenu, navigate, nAnimations, params }) {
  const theme = useTheme();
  const { accounts, balances } = useData();
  const { currentUser } = useAppStorage();

  const [localInfo, setLocalInfo] = useState({
    activeField: null,
    activeFieldAmount: null,
    subAccountToSave: null,
    showModalTransferAccount: false,
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


  const aylinAccounts = accounts.filter((a) => a.type === 'a_account');

  // "por pagar" no se escribe con el teclado: se elige entre el sueldo o cero
  const POR_PAGAR_ID = 'account_aylin_por_pagar';
  const [porPagarOpen, setPorPagarOpen] = useState(false);
  const aylinSalary = balances.byAccount['account_aylin_salary'] || 0;

  const handleOnPressPorPagarOption = (amount) => {
    updateAccountBalance({ account: POR_PAGAR_ID, balance: amount });
    updateChanges({ user: currentUser.name, change: 'aylin' });
    setPorPagarOpen(false);
  };

  // el listado no anima al entrar a la página, solo al volver de una cuenta
  const cameFromAccount = useRef(false);

  const handleOnPressAccount = ({ account }) => {
    cameFromAccount.current = true;
    if (account.id === POR_PAGAR_ID) {
      setPorPagarOpen((prev) => !prev);
    } else if (account.type === 'sub_account') {
      setLocalInfo((prev) => ({
        ...prev,
        activeField: account,
        activeFieldAmount: balances.byAccount[account.id] || 0,
      }));
    } else if (account.hasSubAccount) {
      setLocalInfo((prev) => ({
        ...prev,
        activeField: account,
        activeFieldAmount: 0,
      }));
    } else {
      setLocalInfo((prev) => ({
        ...prev,
        activeField: account,
        activeFieldAmount: balances.byAccount[account.id] || 0,
      }));
    }
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
      subAccountToSave: null,
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
    if (localInfo.showModalTransferAccount) {
      setLocalInfo((prev) => ({ ...prev, showModalTransferAccount: false }));
      return true;
    }
    if (porPagarOpen) {
      setPorPagarOpen(false);
      return true;
    }
    if (localInfo.activeField) {
      closeField();
      return true;
    }
    return false;
  };

  return (
    <GoBackScroll entering={nAnimations.en} exiting={nAnimations.ex} navigate={navigate} onBack={handleGoBack}>
        <Animated.View style={[{ height: windowHeight * 1, width: windowWidth }]}>
          {/* el listado vuelve recién cuando la cuenta terminó de irse: entrando
              encima, las dos cosas se veían juntas un momento y parecía un
              parpadeo */}
          {!localInfo.activeField && (
            <Animated.View entering={cameFromAccount.current ? FadeIn.duration(150).delay(150) : undefined}>
              <ScrollView style={Platform.OS === 'web' ? { height: windowHeight, width: windowWidth } : undefined}>
                <View style={{ width: windowWidth, height: windowHeight * 0.1, justifyContent: 'flex-end', alignItems: 'center' }}>
                  <Text style={{ color: theme.text._1, fontSize: fS.subsTitle, fontWeight: 400 }}>Cuentas Aylin</Text>
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

                  {aylinAccounts
                    .sort((a, b) => a.order - b.order)
                    .map((account) => {
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

                            <AnimatedSwapTextS type={account.isNegative && 'debt'} value={balances.a_account[account.id]?.balance || 0} />
                          </Pressable>

                          {/* opciones de "por pagar": sueldo o cero ------------------------------------ */}

                          {account.id === POR_PAGAR_ID && (
                            <CollapsibleRow open={porPagarOpen}>
                              <View style={{ backgroundColor: theme.bg.subAccount, borderRadius: 10, marginHorizontal: 10, marginBottom: 10 }}>
                                {[
                                  { label: 'Sueldo Aylin', amount: aylinSalary },
                                  { label: 'Pagado', amount: 0 },
                                ].map((option, index) => {
                                  return (
                                    <Pressable onPress={() => handleOnPressPorPagarOption(option.amount)} key={option.label} style={{ height: windowWidth * 0.1, justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 15 }}>
                                      {index > 0 && <View style={{ width: '94%', marginLeft: '3%', height: 1, backgroundColor: theme.bg.tr_1 }}></View>}
                                      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', height: '100%' }}>
                                        <Text style={{ color: theme.text._3, fontSize: fS.subsText }}>{option.label}</Text>
                                        <Text style={{ color: theme.text._3, fontSize: fS.subsText }}>{`$${option.amount.toLocaleString('es-CL')}`}</Text>
                                      </View>
                                    </Pressable>
                                  );
                                })}
                              </View>
                            </CollapsibleRow>
                          )}

                          {accounts.some((a) => a.forAccount === account.id && a.type === 'sub_account' && a.isActive) && (
                            <View style={{ backgroundColor: theme.bg.subAccount, borderRadius: 10, marginHorizontal: 10, marginBottom: 10 }}>
                              {accounts
                                .filter((a) => a.type === 'sub_account' && a.forAccount === account.id && a.isActive)
                                .map((subAccount, index) => {
                                  return (
                                    <Pressable onPress={() => handleOnPressAccount({ account: subAccount })} key={subAccount.id} style={{ height: windowWidth * 0.1, justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 15 }}>
                                      {index > 0 && <View style={{ width: '94%', marginLeft: '3%', height: 1, backgroundColor: theme.bg.tr_1 }}></View>}
                                      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', height: '100%' }}>
                                        <View style={{ flexDirection: 'row', gap: 10 }}>
                                          <Text
                                            style={{
                                              fontSize: fS.subsText,
                                            }}
                                          >
                                            {subAccount.emoji}
                                          </Text>
                                          <Text
                                            style={{
                                              color: theme.text._3,
                                              fontSize: fS.subsText,
                                            }}
                                          >
                                            {subAccount.name}
                                          </Text>
                                        </View>
                                        <Text
                                          style={{
                                            color: theme.text._3,
                                          }}
                                        >
                                          <AnimatedSwapTextS value={balances.byAccount[subAccount.id] || 0} />
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
                    {`Total:  $${balances.aylinTotal.toLocaleString('es-CL')}`}
                  </Text>
                </View>
                <View style={{ width: 100, height: windowHeight * 0.3 }}></View>
              </ScrollView>
            </Animated.View>
          )}
          {/* modals ------------------------------------ */}
          {localInfo.activeField && !localInfo.showModalTransferAccount && !localInfo.selectedTx && <AccountCard amountValue={showHistory ? balances.byAccount[localInfo.activeField.id] || 0 : localInfo.activeFieldAmount} account={localInfo.activeField} setLocalInfoMAccount={setLocalInfo} wide={showHistory} />}
          {showHistory && !localInfo.showModalTransferAccount && !localInfo.selectedTx && <AccountHistory account={localInfo.activeField} onSelect={(tx) => setLocalInfo((prev) => ({ ...prev, selectedTx: tx }))} onNew={(type) => setLocalInfo((prev) => ({ ...prev, selectedTx: { accountId: prev.activeField.id, type, amount: 0, label: '', date: new Date() } }))} />}
          {localInfo.selectedTx && <ModalTransaction tx={localInfo.selectedTx} onCancel={() => setLocalInfo((prev) => ({ ...prev, selectedTx: null }))} />}
          {localInfo.showModalTransferAccount && (
            <ModalTransferAccount
              accounts={aylinAccounts.filter((a) => a.id !== localInfo.activeField.forAccount && !a.isNegative)}
              onCancel={() => {
                setLocalInfo((prev) => ({
                  ...prev,
                  showModalTransferAccount: false,
                }));
              }}
              onSelect={(selected) => {
                const currentAccountId = localInfo.activeField.id;
                const AmountToTransfer = Number(localInfo.activeFieldAmount);

                updateSubAccount({ account: currentAccountId, balance: 0, isActive: false });

                if (selected.hasSubAccount) {
                  const newSubAccountId = accounts.find((a) => a.forAccount === selected.id && a.name === localInfo.activeField.name).id;

                  updateSubAccount({ account: newSubAccountId, balance: AmountToTransfer, isActive: true });
                } else {
                  updateAccountBalance({ account: selected.id, balance: (balances.byAccount[selected.id] || 0) + AmountToTransfer });
                }

                setLocalInfo((prev) => ({
                  ...prev,
                  activeField: null,
                  activeFieldAmount: null,
                  subAccountToSave: null,
                  showModalTransferAccount: false,
                }));
              }}
            />
          )}

          {/* teclado ------------------------------------ */}

          {localInfo.activeField && !showHistory && (
            <Keyboard
              showCancel={localInfo.activeField.hasSubAccount ? (localInfo.subAccountToSave && localInfo.activeFieldAmount > 0 ? false : true) : false}
              showDelete={localInfo.activeField.type === 'sub_account'}
              initialValue={localInfo.activeFieldAmount}
              onChange={(nextValue) => {
                setLocalInfo((prev) => ({
                  ...prev,
                  activeFieldAmount: Number(nextValue),
                }));
              }}
              onCancel={() => {
                setLocalInfo((prev) => ({
                  ...prev,
                  activeField: null,
                  activeFieldAmount: null,
                  subAccountToSave: null,
                }));
              }}
              onTransfer={() => {
                setLocalInfo((prev) => ({
                  ...prev,
                  showModalTransferAccount: true,
                }));
              }}
              onDelete={() => {
                updateSubAccount({ account: localInfo.activeField.id, balance: 0, isActive: false });
                setLocalInfo((prev) => ({
                  ...prev,
                  activeField: null,
                  activeFieldAmount: null,
                  subAccountToSave: null,
                }));
              }}
              onConfirm={(nextValue) => {
                updateChanges({ user: currentUser.name, change: 'aylin' });
                if (localInfo.activeField.type === 'sub_account') {
                  updateAccountBalance({ account: localInfo.activeField.id, balance: Number(nextValue) });
                } else if (localInfo.activeField.hasSubAccount) {
                  updateSubAccount({ account: localInfo.subAccountToSave.id, balance: Number(nextValue), isActive: true });
                } else {
                  updateAccountBalance({ account: localInfo.activeField.id, balance: Number(nextValue) });
                }

                setLocalInfo((prev) => ({
                  ...prev,
                  activeField: null,
                  activeFieldAmount: null,
                  subAccountToSave: null,
                }));
              }}
            />
          )}
        </Animated.View>
    </GoBackScroll>
  );
}
