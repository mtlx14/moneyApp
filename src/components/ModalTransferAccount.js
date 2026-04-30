import { BlurView } from 'expo-blur';
import { Dimensions, Pressable, Text, View } from 'react-native';
import { useTheme } from '../theme/useTheme';
import Animated, { useSharedValue, withDelay, withTiming, Easing, useAnimatedStyle } from 'react-native-reanimated';
import { useEffect } from 'react';
import { fS } from '../theme/theme';

export default function ModalTransferAccount({ accounts, onCancel, onSelect }) {
  const windowWidth = Dimensions.get('window').width;
  const windowHeight = Dimensions.get('window').height;
  const theme = useTheme();
  const rotation = useSharedValue(180);
  const textOpacity = useSharedValue(0);

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

  return (
    <Animated.View intensity={8} style={[{ position: 'absolute', width: windowWidth, height: windowHeight * 0.6, top: 0, left: 0, justifyContent: 'center', alignItems: 'center' }, animatedStyle]}>
      <BlurView intensity={30} style={{ width: windowWidth * 0.8, height: windowWidth * 0.12 * (accounts.length + 1), borderRadius: 20, overflow: 'hidden' }}>
        {accounts
          .sort((a, b) => a.order - b.order)
          .map((account, index) => {
            return (
              <Animated.View key={account.id} style={[{ flex: 1, borderBottomColor: theme.bg.tr_1, borderBottomWidth: 1 }, opacityAnimatedStyle]}>
                <Pressable onPress={() => onSelect(account)} style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                  <Text style={{ color: theme.text._1, fontSize: fS.modalTransfer }}>{account.name}</Text>
                </Pressable>
              </Animated.View>
            );
          })}
        <Animated.View key={'cancelar'} style={[{ flex: 1, backgroundColor: theme.bg.tr_3 }, opacityAnimatedStyle]}>
          <Pressable onPress={() => onCancel()} style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ color: theme.text._1, fontSize: fS.modalTransfer }}>Cancelar</Text>
          </Pressable>
        </Animated.View>
      </BlurView>
    </Animated.View>
  );
}
