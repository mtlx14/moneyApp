import { View, Text, Dimensions, Platform, TextInput, Pressable, ScrollView } from 'react-native';
import { useTheme } from '../../../theme/useTheme.js';
import { useData } from '../../../../context.js';
import { useEffect, useRef, useState } from 'react';
import Animated, { BounceInDown, FlipInXDown, Layout, RotateInDownLeft, RotateInDownRight, SlideInDown, SlideInLeft, SlideOutLeft, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming, Easing, FadeInLeft, FadeOutLeft } from 'react-native-reanimated';
import AnimatedSwapTextL from '../components/AnimatedSwapTextL.js';
import AnimatedSwapTextS from '../components/AnimatedSwapTextS.js';
import { Keyboard } from '../components/Keyboard.js';

import AccountCard from '../components/AccountCard.js';

import UserTag from '../components/UserTag.js';
import { updateAccountBalance, updateChanges } from '../../../services.js';
import { useAppStorage } from '../../../../appStorageProvider.js';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fS } from '../../../theme/theme.js';
import { amountForMonth, monthName } from '../../../helpers.js';
import OkToChanges from '../components/OkToChanges.js';
import NextMonthBillRow from '../components/NextMonthBillRow.js';
import FadingScroll from '../components/FadingScroll.js';
import { CONTENT_LEFT_HOME } from '../layout.js';

export default function Home({ setShowMenu, navigate, nAnimations }) {
  const insets = useSafeAreaInsets();
  const windowHeight = Dimensions.get('window').height - insets.top;
  const windowWidth = Dimensions.get('window').width;
  const theme = useTheme();
  const { accounts, balances, appMeta, bills } = useData();
  const { currentUser } = useAppStorage();
  const { isReady } = useAppStorage();
  const { monthOffset } = useAppStorage();
  const [localInfo, setLocalInfo] = useState({
    activeField: null,
    activeFieldAmount: null,
  });

  // página visible del scroll horizontal: 0 mes actual, 1 proyección del mes siguiente
  const [page, setPage] = useState(0);

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
        activeFieldAmount: balances.byAccount[account.id] || 0,
      }));
    }
  };
  if (!isReady) return null;

  return (
    <Animated.View style={{ height: windowHeight, width: windowWidth }} entering={nAnimations.en} exiting={nAnimations.ex}>
      <ScrollView
        horizontal
        pagingEnabled={true}
        showsHorizontalScrollIndicator={false}
        bounces={false}
        scrollEventThrottle={32}
        onScroll={(e) => {
          const nextPage = Math.round(e.nativeEvent.contentOffset.x / windowWidth);
          if (nextPage !== page) setPage(nextPage);
        }}
        style={{ width: windowWidth }}
      >
        <View>
          <Animated.View style={[{ width: windowWidth, height: windowHeight * 0.25, justifyContent: 'flex-end', alignItems: 'center' }, activeFieldOpacityAnimatedStyle]}>
            <AnimatedSwapTextL value={balances.matiasTotal + balances.aylinTotal} />
            <Text style={{ color: theme.text._2, fontWeight: theme.fw.home_acc_text, fontSize: fS.homeSubText }}>Saldo total</Text>
          </Animated.View>

          <View style={{ width: windowWidth, height: windowHeight * 0.6, position: 'relative', paddingHorizontal: windowWidth * 0.1, paddingLeft: CONTENT_LEFT_HOME, opacity: localInfo.activeField ? 0 : 1, justifyContent: 'center' }}>
            <View>
              <Pressable onPress={() => navigate('aylin_accounts')} style={{ flexDirection: 'row', justifyContent: 'space-between', height: windowWidth * 0.1, alignItems: 'center' }}>
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
                <Text style={{ color: theme.text._3, fontSize: fS.homeSubText, fontWeight: theme.fw.home_acc_text }}>{'🧾' + '  ' + 'Cuentas por pagar'}</Text>

                <AnimatedSwapTextS type={'debt'} value={`${balances.billsBalances.toPay || 0}`} />
              </Pressable>
            </View>
            <View
              style={{
                backgroundColor: theme.bg.tr_05,
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginTop: 0,
                height: windowWidth * 0.1,
                alignItems: 'center',
                marginHorizontal: -windowWidth * 0.03,
                borderRadius: 10,
                padding: windowWidth * 0.03,
              }}
            >
              <Text style={{ color: theme.text._3, fontSize: fS.homeSubText, fontWeight: theme.fw.home_acc_text }}>{'🤑' + '  ' + 'Saldo después de pagar cuentas'}</Text>
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
          <View style={{ width: windowWidth, height: windowHeight * 0.75, position: 'relative', paddingHorizontal: windowWidth * 0.1, paddingLeft: CONTENT_LEFT_HOME, opacity: localInfo.activeField ? 0 : 1, justifyContent: 'center' }}>
            <View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, overflow: 'hidden' }}>
                <Text style={{ color: theme.text._2, fontSize: fS.homeSubText, fontWeight: theme.fw.home_acc_text }}>{'💷' + '  ' + 'Saldo actual'}</Text>

                <AnimatedSwapTextS value={balances.totalAfterPayments || 0} />
              </View>

              <View style={{ backgroundColor: theme.bg.tr_1, width: windowWidth * 0.85, height: 1, marginLeft: -windowWidth * 0.025 }}></View>

              <Pressable onPress={() => handleAccountPress({ accountId: 'account_aylin_salary' })} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, overflow: 'hidden' }}>
                <Text style={{ color: theme.text._2, fontSize: fS.homeSubText, fontWeight: theme.fw.home_acc_text }}>{'🌸' + '  ' + 'Sueldo Aylin'}</Text>

                <AnimatedSwapTextS type={'income'} value={balances.byAccount['account_aylin_salary'] || 0} />
              </Pressable>
              <View style={{ backgroundColor: theme.bg.tr_1, width: windowWidth * 0.85, height: 1, marginLeft: -windowWidth * 0.025 }}></View>

              <Pressable onPress={() => handleAccountPress({ accountId: 'account_matias_salary' })} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, overflow: 'hidden' }}>
                <Text style={{ color: theme.text._2, fontSize: fS.homeSubText, fontWeight: theme.fw.home_acc_text }}>{'🚀' + '  ' + 'Sueldo Matías'}</Text>

                <AnimatedSwapTextS type={'income'} value={balances.byAccount['account_matias_salary'] || 0} />
              </Pressable>
            </View>
            <View
              style={{
                backgroundColor: theme.bg.tr_1,
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginTop: 2,
                paddingVertical: 10,
                marginHorizontal: -windowWidth * 0.03,
                borderRadius: 10,
                padding: windowWidth * 0.03,
              }}
            >
              <Text style={{ color: theme.text.strong, fontSize: fS.homeSubText, fontWeight: theme.fw.home_acc_text }}>{'💶' + '  ' + 'Saldo Total'}</Text>
              <AnimatedSwapTextS value={balances.nextMonth.beforePayments} />
            </View>
            {/* Lo único que crece es esta lista, así que es lo único que scrollea:
                los saldos de arriba y el total de abajo quedan fijos. */}
            <FadingScroll>
              <Pressable style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, overflow: 'hidden', marginTop: 20 }}>
                <Text style={{ color: theme.text._3, fontSize: fS.homeSubText, fontWeight: theme.fw.home_acc_text }}>{'🧾' + '  ' + 'Gastos fijos'}</Text>

                <AnimatedSwapTextS type={'debt'} value={bills.filter((b) => b.type === 'fixed' || b.type === 'sub').reduce((a, b) => a + amountForMonth(b, monthOffset + 1), 0)} />
              </Pressable>
              {/* se montan todos los planeados y cada fila se abre o cierra según si entra en el mes siguiente */}
              {bills
                .filter((b) => b.type === 'planned')
                .map((bill) => {
                  return <NextMonthBillRow key={bill.id} bill={bill} included={!!balances?.nextMonth?.bills?.some((b) => b.id === bill.id)} monthOffset={monthOffset} />;
                })}
            </FadingScroll>
            <View
              style={{
                backgroundColor: theme.bg.tr_1,
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginTop: 2,
                paddingVertical: 10,
                marginHorizontal: -windowWidth * 0.03,
                borderRadius: 10,
                padding: windowWidth * 0.03,
              }}
            >
              <Text style={{ color: theme.text.strong, fontSize: fS.homeSubText, fontWeight: theme.fw.home_acc_text }}>{'💶' + '  ' + 'Saldo después de pagar cuentas'}</Text>
              <AnimatedSwapTextS value={balances.nextMonth.afterPayments} />
            </View>
          </View>
        </View>
      </ScrollView>

      {/* modals ------------------------------------ */}

      {!localInfo.activeField && <UserTag />}

      {/* mes de la página que se está viendo, en la fila del globo de usuario ------------------------------------ */}

      {!localInfo.activeField && (
        <View style={{ position: 'absolute', top: 20, right: 20, height: windowWidth * 0.07, justifyContent: 'center' }}>
          <Text style={{ color: theme.text._2, fontSize: fS.userTagName }}>{monthName(page + monthOffset)}</Text>
        </View>
      )}
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
