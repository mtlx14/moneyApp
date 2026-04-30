import { View, Text, Dimensions, Platform, TextInput, Pressable, ScrollView, Easing } from 'react-native';
import { useTheme } from '../theme/useTheme.js';
import { useData } from '../../context.js';
import { useEffect, useRef, useState } from 'react';
import Animated, { SlideInRight, SlideOutRight, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

const windowHeight = Dimensions.get('window').height;
const windowWidth = Dimensions.get('window').width;
export default function FixedExpenses({ setShowMenu }) {
  const theme = useTheme();
  const { accounts, bills } = useData();
  const [modalOpen, setModalOpen] = useState(false);
  const inputRef = useRef(null);

  const modalOpenOpacity = useSharedValue(1);
  const modalOpenOpacityAnimatedStyle = useAnimatedStyle(() => ({
    opacity: modalOpenOpacity.value,
  }));

  useEffect(() => {
    modalOpenOpacity.value = withTiming(modalOpen ? 0 : 1, {
      duration: 100,
    });
    setTimeout(() => {
      window.scrollTo(0, 0);
    }, 50);
  }, [modalOpen]);

  return (
    <>
      <Animated.View style={[{ height: windowHeight * 1.2, width: windowWidth }, modalOpenOpacityAnimatedStyle]} entering={SlideInRight} exiting={SlideOutRight}>
        <View style={{ width: windowWidth, height: windowHeight * 0.2, justifyContent: 'flex-end', alignItems: 'center' }}>
          <Text style={{ color: theme.text._1, fontSize: 18, fontWeight: 400 }}>Gastos fijos</Text>
        </View>
        <View
          style={{
            width: windowWidth,
            padding: windowWidth * 0.05,
            gap: 5,
            marginTop: windowHeight * 0.05,
          }}
        >
          {bills
            .sort((a, b) => a.order - b.order)
            .map((bill) => {
              return (
                <Pressable style={{ width: '100%', backgroundColor: theme.bg.tr_05, borderRadius: 10, height: windowWidth * 0.12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 15 }}>
                  <View style={{ flexDirection: 'row', gap: 10 }}>
                    <Text>{bill.emoji}</Text>

                    <Text
                      style={{
                        color: theme.text._2,
                      }}
                    >
                      {bill.label}
                    </Text>
                  </View>
                  <Text
                    style={{
                      color: theme.text._2,
                    }}
                  >
                    {`$${bill.amount.toLocaleString('es-CL')}`}
                  </Text>
                </Pressable>
              );
            })}
          <Pressable style={{ width: '100%', backgroundColor: theme.bg.tr_05, borderRadius: 10, height: windowWidth * 0.12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 15 }}>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Text>{'🧾'}</Text>

              <Text
                style={{
                  color: theme.text._2,
                }}
              >
                {'Total'}
              </Text>
            </View>
            <Text
              style={{
                color: theme.text._2,
              }}
            >
              {`$${Object.values(bills)
                .reduce((a, b) => a + b.amount, 0)
                .toLocaleString('es-CL')}`}
            </Text>
          </Pressable>
          {/* <Pressable style={{ width: '100%', backgroundColor: theme.bg.tr_05, borderRadius: 10, padding: 15, height: windowWidth * 0.12, justifyContent: 'center', alignItems: 'center', opacity: 0.5 }}>
            <Text style={{ color: theme.text._2, fontSize: 30, marginBottom: windowWidth * 0.01 }}>+</Text>
          </Pressable> */}
        </View>
      </Animated.View>
    </>
  );
}
