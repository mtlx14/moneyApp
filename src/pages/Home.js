import { View, Text, Dimensions, Platform, TextInput, Pressable, ScrollView } from 'react-native';
import { useTheme } from '../theme/useTheme.js';
import { useData } from '../../context.js';
import { useEffect, useRef, useState } from 'react';
import Animated, { BounceInDown, FlipInXDown, Layout, RotateInDownLeft, RotateInDownRight, SlideInDown, SlideInLeft, SlideOutLeft, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming, Easing, FadeInLeft, FadeOutLeft } from 'react-native-reanimated';
import AnimatedSwapTextL from '../components/AnimatedSwapTextL.js';
import AnimatedSwapTextS from '../components/AnimatedSwapTextS.js';
import { Keyboard } from '../components/Keyboard.js';

import AccountCard from '../components/AccountCard.js';

import UserTag from '../components/UserTag.js';
import { updateAccountBalance, updateChanges } from '../services.js';
import { useAppStorage } from '../../appStorageProvider.js';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fS } from '../theme/theme.js';
import { currentInstallment } from '../helpers.js';
import OkToChanges from '../components/OkToChanges.js';

export default function Home({ setShowMenu, navigate, nAnimations }) {
  const insets = useSafeAreaInsets();
  const windowHeight = Dimensions.get('window').height - insets.top;
  const windowWidth = Dimensions.get('window').width;
  const theme = useTheme();
  const { accounts, balances, appMeta, bills } = useData();
  const { currentUser } = useAppStorage();
  const { isReady } = useAppStorage();
  const [localInfo, setLocalInfo] = useState({
    activeField: null,
    activeFieldAmount: null,
  });

  const [showChanges, setShowChanges] = useState([]);
  const changesOpacity = useSharedValue(1);
  const changesOpacityAnimatedStyle = useAnimatedStyle(() => ({
    opacity: changesOpacity.value,
  }));

  useEffect(() => {
    if (currentUser.name === 'matias' && appMeta.mOkDate && appMeta.aChangesDate && appMeta.mOkDate < appMeta.aChangesDate) {
      setShowChanges(appMeta.aChanges);
      changesOpacity.value = withRepeat(withSequence(withTiming(0.4, { duration: 1000, easing: Easing.in(Easing.quad) }), withTiming(1, { duration: 1000, easing: Easing.out(Easing.quad) })), -1, false);
    } else if (currentUser.name === 'aylin' && appMeta.aOkDate && appMeta.mChangesDate && appMeta.aOkDate < appMeta.mChangesDate) {
      setShowChanges(appMeta.mChanges);
      changesOpacity.value = withRepeat(withSequence(withTiming(0.4, { duration: 1000, easing: Easing.in(Easing.quad) }), withTiming(1, { duration: 1000, easing: Easing.out(Easing.quad) })), -1, false);
    } else {
      setShowChanges([]);
    }
  }, [appMeta, currentUser]);

  const activeFieldOpacity = useSharedValue(1);
  const activeFieldOpacityAnimatedStyle = useAnimatedStyle(() => ({
    opacity: activeFieldOpacity.value,
  }));
  useEffect(() => {
    activeFieldOpacity.value = withTiming(localInfo.activeField ? 0 : 1, {
      duration: 200,
    });
    if (localInfo.activeField) setShowMenu(false);
    else setShowMenu(true);
  }, [localInfo.activeField]);

  const handleAccountPress = ({ accountId }) => {
    const account = accounts.find((a) => a.id === accountId);
    if (accounts && accounts.length > 0) {
      setLocalInfo((prev) => ({
        ...prev,
        activeField: account,
        activeFieldAmount: account.balance,
      }));
    }
  };
  if (!isReady) return null;

  return (
    <Animated.View style={{ height: windowHeight, width: windowWidth }} entering={nAnimations.en} exiting={nAnimations.ex}>
      <ScrollView horizontal pagingEnabled={true} showsHorizontalScrollIndicator={false} bounces={false} style={{ width: windowWidth }}>
        <View>
          <Animated.View style={[{ width: windowWidth, height: windowHeight * 0.25, justifyContent: 'flex-end', alignItems: 'center' }, activeFieldOpacityAnimatedStyle]}>
            <AnimatedSwapTextL value={balances.matiasTotal + balances.aylinTotal} />
            <Text style={{ color: theme.text._2, fontWeight: theme.fw.home_acc_text, fontSize: fS.homeSubText }}>Saldo total</Text>
          </Animated.View>

          <View style={{ width: windowWidth, height: windowHeight * 0.6, position: 'relative', paddingHorizontal: windowWidth * 0.1, opacity: localInfo.activeField ? 0 : 1, justifyContent: 'center' }}>
            <View>
              <Pressable onPress={() => handleAccountPress({ accountId: 'account_aylin' })} style={{ flexDirection: 'row', justifyContent: 'space-between', height: windowWidth * 0.1, alignItems: 'center' }}>
                {showChanges.includes('aylin') && (
                  // <Animated.View
                  //   style={[
                  //     {
                  //       position: 'absolute',
                  //       width: windowWidth * 0.86,
                  //       height: windowWidth * 0.1,
                  //       backgroundColor: theme.bg.green_03,
                  //       left: -windowWidth * 0.03,
                  //       borderTopLeftRadius: 10,
                  //       borderTopRightRadius: 10,
                  //     },
                  //     changesOpacityAnimatedStyle,
                  //   ]}
                  // ></Animated.View>
                  <Animated.View
                    entering={FadeInLeft}
                    exiting={FadeOutLeft.duration(100)}
                    style={[
                      {
                        position: 'absolute',
                        width: windowWidth * 0.02,
                        height: windowWidth * 0.02,
                        backgroundColor: theme.bg.green,
                        left: -windowWidth * 0.05,
                        borderRadius: 10,
                      },
                      changesOpacityAnimatedStyle,
                    ]}
                  ></Animated.View>
                )}
                <Text style={{ color: theme.text._2, fontSize: fS.homeSubText, fontWeight: theme.fw.home_acc_text }}>{'🌸' + '  ' + 'Aylin'}</Text>

                <AnimatedSwapTextS value={balances.aylinTotal} />
              </Pressable>
              <View style={{ backgroundColor: theme.text._4, width: windowWidth * 0.86, height: 1, marginLeft: -windowWidth * 0.03 }}></View>

              <Pressable onPress={() => navigate('matias_accounts')} style={{ flexDirection: 'row', justifyContent: 'space-between', height: windowWidth * 0.1, alignItems: 'center' }}>
                {showChanges.includes('matias') && (
                  <Animated.View
                    entering={FadeInLeft}
                    exiting={FadeOutLeft.duration(100)}
                    style={[
                      {
                        position: 'absolute',
                        width: windowWidth * 0.02,
                        height: windowWidth * 0.02,
                        backgroundColor: theme.bg.green,
                        left: -windowWidth * 0.05,
                        borderRadius: 10,
                      },
                      changesOpacityAnimatedStyle,
                    ]}
                  ></Animated.View>
                )}
                <Text style={{ color: theme.text._2, fontSize: fS.homeSubText, fontWeight: theme.fw.home_acc_text }}>{'🚀' + '  ' + 'Matías'}</Text>

                <AnimatedSwapTextS value={balances.matiasTotal} />
              </Pressable>

              <Pressable onPress={() => navigate('monthly_summary', 1)} style={{ flexDirection: 'row', justifyContent: 'space-between', height: windowWidth * 0.1, alignItems: 'center', marginTop: 30 }}>
                {showChanges.includes('bills') && (
                  <Animated.View
                    entering={FadeInLeft}
                    exiting={FadeOutLeft.duration(100)}
                    style={[
                      {
                        position: 'absolute',
                        width: windowWidth * 0.02,
                        height: windowWidth * 0.02,
                        backgroundColor: theme.bg.green,
                        left: -windowWidth * 0.05,
                        borderRadius: 10,
                      },
                      changesOpacityAnimatedStyle,
                    ]}
                  ></Animated.View>
                )}
                <Text style={{ color: theme.text._3, fontSize: fS.homeSubText, fontWeight: theme.home_acc_text_2 }}>{'🧾' + '  ' + 'Cuentas por pagar'}</Text>

                <AnimatedSwapTextS type={'debt'} value={`${balances.billsBalances.toPay || 0}`} />
              </Pressable>
            </View>
            <View
              style={{
                backgroundColor: theme.bg.tr_1,
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginTop: 0,
                height: windowWidth * 0.1,
                alignItems: 'center',
                width: windowWidth * 0.86,
                marginLeft: -windowWidth * 0.03,
                borderRadius: 10,
                padding: windowWidth * 0.03,
              }}
            >
              <Text style={{ color: theme.text._3, fontSize: fS.homeSubText, fontWeight: theme.home_acc_text_2 }}>{'🤑' + '  ' + 'Saldo después de pagar cuentas'}</Text>
              <AnimatedSwapTextS type={'green'} value={balances.totalAfterPayments || 0} />
            </View>
          </View>
        </View>
        {/* NEXT MONTH */}
        <View>
          <Animated.View style={[{ width: windowWidth, height: windowHeight * 0.25, justifyContent: 'flex-end', alignItems: 'center' }, activeFieldOpacityAnimatedStyle]}>
            <AnimatedSwapTextL value={balances.nextMonth.afterPayments} />
            <Text style={{ color: theme.text._2, fontWeight: theme.fw.home_acc_text, fontSize: fS.homeSubText }}>Saldo después de pagar cuentas</Text>
          </Animated.View>
          <View style={{ width: windowWidth, height: windowHeight * 0.65, position: 'relative', paddingHorizontal: windowWidth * 0.1, opacity: localInfo.activeField ? 0 : 1, justifyContent: 'center' }}>
            <View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, overflow: 'hidden' }}>
                <Text style={{ color: theme.text._2, fontSize: fS.homeSubText, fontWeight: theme.fw.home_acc_text }}>{'💷' + '  ' + 'Saldo actual'}</Text>

                <AnimatedSwapTextS value={balances.totalAfterPayments || 0} />
              </View>

              <View style={{ backgroundColor: theme.bg.tr_1, width: windowWidth * 0.85, height: 1, marginLeft: -windowWidth * 0.025 }}></View>

              <Pressable onPress={() => handleAccountPress({ accountId: 'account_aylin_salary' })} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, overflow: 'hidden' }}>
                <Text style={{ color: theme.text._2, fontSize: fS.homeSubText, fontWeight: theme.fw.home_acc_text }}>{'🌸' + '  ' + 'Sueldo Aylin'}</Text>

                <AnimatedSwapTextS type={'income'} value={accounts.find((a) => a.id === 'account_aylin_salary')?.balance || 0} />
              </Pressable>
              <View style={{ backgroundColor: theme.bg.tr_1, width: windowWidth * 0.85, height: 1, marginLeft: -windowWidth * 0.025 }}></View>

              <Pressable onPress={() => handleAccountPress({ accountId: 'account_matias_salary' })} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, overflow: 'hidden' }}>
                <Text style={{ color: theme.text._2, fontSize: fS.homeSubText, fontWeight: theme.fw.home_acc_text }}>{'🚀' + '  ' + 'Sueldo Matías'}</Text>

                <AnimatedSwapTextS type={'income'} value={accounts.find((a) => a.id === 'account_matias_salary')?.balance || 0} />
              </Pressable>
            </View>
            <View
              style={{
                backgroundColor: theme.bg.tr_1,
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginTop: 2,
                paddingVertical: 10,
                width: windowWidth * 0.86,
                marginLeft: -windowWidth * 0.03,
                borderRadius: 10,
                padding: windowWidth * 0.03,
              }}
            >
              <Text style={{ color: theme.text._3, fontSize: fS.homeSubText, fontWeight: theme.home_acc_text_2 }}>{'💶' + '  ' + 'Saldo Total'}</Text>
              <AnimatedSwapTextS value={balances.nextMonth.beforePayments} />
            </View>
            <Pressable style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, overflow: 'hidden', marginTop: 20 }}>
              <Text style={{ color: theme.text._2, fontSize: fS.homeSubText, fontWeight: theme.fw.home_acc_text }}>{'🧾' + '  ' + 'Gastos fijos'}</Text>

              <AnimatedSwapTextS type={'debt'} value={bills.filter((b) => b.type === 'fixed' || b.type === 'sub').reduce((a, b) => a + b.amount, 0)} />
            </Pressable>
            {balances?.nextMonth?.bills.map((bill) => {
              return (
                <View key={bill.id}>
                  <View style={{ backgroundColor: theme.bg.tr_1, width: windowWidth * 0.85, height: 1, marginLeft: -windowWidth * 0.025 }}></View>

                  <View key={bill.id} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, overflow: 'hidden' }}>
                    <Text style={{ color: theme.text._2, fontSize: fS.homeSubText, fontWeight: theme.fw.home_acc_text }}>{`${bill.emoji}   ${bill.label} ${bill.inMonths > 0 ? currentInstallment(bill.firstMonth) + 1 + '/' + bill.inMonths : ''}`}</Text>

                    <AnimatedSwapTextS type={'debt'} value={bill.amount} />
                  </View>
                </View>
              );
            })}
            <View
              style={{
                backgroundColor: theme.bg.tr_1,
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginTop: 2,
                paddingVertical: 10,
                width: windowWidth * 0.86,
                marginLeft: -windowWidth * 0.03,
                borderRadius: 10,
                padding: windowWidth * 0.03,
              }}
            >
              <Text style={{ color: theme.text._3, fontSize: fS.homeSubText, fontWeight: theme.home_acc_text_2 }}>{'💶' + '  ' + 'Saldo después de pagar cuentas'}</Text>
              <AnimatedSwapTextS value={balances.nextMonth.afterPayments} />
            </View>
          </View>
        </View>
      </ScrollView>

      {/* modals ------------------------------------ */}

      {!localInfo.activeField && <UserTag />}
      {localInfo.activeField && <AccountCard amountValue={localInfo.activeFieldAmount} account={localInfo.activeField} />}
      {showChanges?.length > 0 && <OkToChanges user={currentUser} setShowChanges={setShowChanges} />}

      {/* teclado ------------------------------------ */}

      {localInfo.activeField && (
        <Keyboard
          initialValue={localInfo.activeFieldAmount}
          onChange={(nextValue) => {
            setLocalInfo((prev) => ({
              ...prev,
              activeFieldAmount: Number(nextValue),
            }));
          }}
          onConfirm={(nextValue) => {
            updateAccountBalance({ account: localInfo.activeField.id, balance: Number(nextValue) });
            if (localInfo.activeField.name === 'aylin') {
              updateChanges({ user: currentUser.name, change: 'aylin' });
            }

            setLocalInfo((prev) => ({
              ...prev,
              activeField: null,
              activeFieldAmount: null,
            }));
          }}
        />
      )}
    </Animated.View>
  );
}
