import { View, Text, Dimensions, Platform, TextInput, Pressable, ScrollView, Easing } from 'react-native';
import { useTheme } from '../theme/useTheme.js';
import { useData } from '../../context.js';
import { useEffect, useRef, useState } from 'react';
import Animated, { FadeIn, FadeOut, SlideInRight, SlideOutRight, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import AccountCard from '../components/AccountCard.js';
import { Keyboard } from '../components/Keyboard.js';

import AnimatedSwapTextS from '../components/AnimatedSwapTextS.js';
import { updateAccountBalance, updateChanges, updateSubAccount } from '../services.js';
import ModalTransferAccount from '../components/ModalTransferAccount.js';
import { fS } from '../theme/theme.js';
import GoBackScroll from '../components/GoBackScroll.js';
import { useAppStorage } from '../../appStorageProvider.js';

const windowHeight = Dimensions.get('window').height;
const windowWidth = Dimensions.get('window').width;

export default function Matias_accounts({ setShowMenu, navigate, nAnimations }) {
  const theme = useTheme();
  const { accounts, balances } = useData();
  const { currentUser } = useAppStorage();

  const [localInfo, setLocalInfo] = useState({
    activeField: null,
    activeFieldAmount: null,
    subAccountToSave: null,
    showModalTransferAccount: false,
  });

  useEffect(() => {
    if (localInfo.activeField) setShowMenu(false);
    else setShowMenu(true);
  }, [localInfo.activeField]);

  const handleOnPressAccount = ({ account }) => {
    if (account.type === 'sub_account') {
      setLocalInfo((prev) => ({
        ...prev,
        activeField: account,
        activeFieldAmount: account.balance,
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
        activeFieldAmount: account.balance,
      }));
    }
  };

  return (
    <>
      <GoBackScroll navigate={navigate}>
        <Animated.View style={[{ height: windowHeight * 1, width: windowWidth }]} entering={nAnimations.en} exiting={nAnimations.ex}>
          {!localInfo.activeField && (
            <View>
              <ScrollView style={Platform.OS === 'web' ? { height: windowHeight, width: windowWidth } : undefined}>
                <View style={{ width: windowWidth, height: windowHeight * 0.1, justifyContent: 'flex-end', alignItems: 'center' }}>
                  <Text style={{ color: theme.text._1, fontSize: fS.subsTitle, fontWeight: 400 }}>Cuentas Matías</Text>
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
                  <Text style={{ color: theme.text._3, padding: 5, opacity: 0, fontSize: fS.mSummarySubtitle }}>a</Text>

                  {accounts
                    .filter((b) => b.type === 'm_account')
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

                            <AnimatedSwapTextS type={account.isNegative && 'debt'} value={balances.m_account[account.id].balance} />
                          </Pressable>
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
                                          <AnimatedSwapTextS value={subAccount.balance} />
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
            </View>
          )}
          {/* modals ------------------------------------ */}
          {localInfo.activeField && !localInfo.showModalTransferAccount && <AccountCard amountValue={localInfo.activeFieldAmount} account={localInfo.activeField} setLocalInfoMAccount={setLocalInfo} />}
          {localInfo.showModalTransferAccount && (
            <ModalTransferAccount
              accounts={accounts.filter((a) => a.type === 'm_account' && a.id !== localInfo.activeField.forAccount && !a.isNegative)}
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
                  updateAccountBalance({ account: selected.id, balance: selected.balance + AmountToTransfer });
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

          {localInfo.activeField && (
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
                updateChanges({ user: currentUser.name, change: 'matias' });
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
    </>
  );
}
