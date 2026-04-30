import { useEffect, useState } from 'react';
import { View, Text, Dimensions, TextInput, Pressable } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing, withSequence, withDelay } from 'react-native-reanimated';
import { Image } from 'expo-image';
import { useTheme } from '../theme/useTheme';
import { useData } from '../../context';
import { subAccountCard } from '../../data.js';
import { fS } from '../theme/theme.js';

export default function AccountCard({ amountValue, account, setLocalInfoMAccount = null }) {
  const theme = useTheme();
  const { accounts } = useData();
  const windowHeight = Dimensions.get('window').height;
  const windowWidth = Dimensions.get('window').width;
  const rotation = useSharedValue(100);
  const textOpacity = useSharedValue(0);

  const [localInfo, setLocalInfo] = useState({
    accountNameToRender: account.id === 'account_aylin' ? 'Saldo de Aylin' : account.id === 'account_matias' ? 'Saldo de Matías' : account.type === 'sub_account' ? `${accounts.find((a) => a.id === account.forAccount).name} - ${account.name}` : account.hasSubAccount ? 'Agregar cuenta' : account.name,
    imageToRender:
      account.id === 'account_aylin'
        ? require('../../assets/images/card_pink-purple.png')
        : account.id === 'account_matias'
          ? require('../../assets/images/card_black-blue.png')
          : account.id === 'account_aylin_salary'
            ? require('../../assets/images/card_pink-purple.png')
            : account.hasSubAccount
              ? require('../../assets/images/card_transparent.png')
              : require('../../assets/images/card_black-blue.png'),
  });

  const subAccounts = account.hasSubAccount ? accounts.filter((a) => a.type === 'sub_account' && a.forAccount === account.id && !a.isActive) : [];

  useEffect(() => {
    rotation.value = withTiming(360, {
      duration: 600,
      easing: Easing.out(Easing.cubic),
    });
    textOpacity.value = withDelay(
      200,
      withTiming(1, {
        duration: 400,
      }),
    );
  }, []);

  const opacityAnimatedStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
  }));

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ perspective: 1000 }, { rotateX: `${rotation.value}deg` }],
  }));

  const handleOnPressSubAccount = (subAccount) => {
    setLocalInfo((prev) => ({
      ...prev,
      accountNameToRender: subAccount.name,
      imageToRender: subAccountCard[subAccount.name],
    }));
    setLocalInfoMAccount((prev) => ({
      ...prev,
      subAccountToSave: subAccount,
    }));
    rotation.value = withSequence(
      withTiming(180, {
        duration: 0,
        easing: Easing.out(Easing.cubic),
      }),
      withTiming(360, {
        duration: 600,
        easing: Easing.out(Easing.cubic),
      }),
    );
    textOpacity.value = withSequence(
      withTiming(0, {
        duration: 0,
      }),
      withDelay(
        100,
        withTiming(1, {
          duration: 400,
        }),
      ),
    );
  };

  return (
    <>
      <Animated.View intensity={8} style={[{ position: 'absolute', width: windowWidth, height: windowHeight * 0.6, top: 0, left: 0, justifyContent: 'center', alignItems: 'center' }, animatedStyle]}>
        <View style={{ width: windowWidth * 0.9, aspectRatio: 1 / 1 }}>
          <Image source={localInfo.imageToRender} style={{ width: windowWidth * 0.9, aspectRatio: 1 / 1 }} transition={400}></Image>
          <Animated.View
            style={[
              {
                position: 'absolute',
                // top: windowHeight * 0.205,
                // left: -windowWidth * 0.05,
                width: windowWidth * 0.9,
                height: windowWidth * 0.9,
                justifyContent: 'center',
                alignItems: 'center',
              },
              opacityAnimatedStyle,
            ]}
          >
            <Text
              style={{
                color: theme.text._2,
                fontWeight: 400,
                fontSize: fS.accountCardText,
                textAlign: 'center',
              }}
            >
              {localInfo.accountNameToRender}
            </Text>
            <TextInput
              value={`${account?.isNegative ? '-' : ''}$${Number(amountValue).toLocaleString('es-CL')}`}
              style={{
                height: windowHeight * 0.06,
                borderRadius: 100,
                textAlign: 'center',
                color: theme.text._2,
                fontSize: fS.accountCardNumber,
              }}
            ></TextInput>
          </Animated.View>
        </View>
      </Animated.View>
      <View style={{ position: 'absolute', width: windowWidth, top: windowHeight * 0.46, flexDirection: 'row', justifyContent: 'center', gap: 8 }}>
        {subAccounts.map((subAccount, index) => {
          return (
            <Pressable
              onPress={() => handleOnPressSubAccount(subAccount)}
              key={subAccount.id}
              style={{
                backgroundColor: theme.bg.tr_1,
                paddingHorizontal: 20,
                paddingVertical: 7,
                borderRadius: 10,
                shadowColor: 'rgba(0, 0, 0, 0.4)',
                shadowOffset: {
                  width: 0,
                  height: 5,
                },
                shadowRadius: 10,
                overflow: 'hidden',
              }}
            >
              <Text style={{ color: theme.text._1, fontSize: fS.userTagName }}>{subAccount.name}</Text>
            </Pressable>
          );
        })}
      </View>
    </>
  );
}
