import { View, Dimensions, Text, Pressable } from 'react-native';
import { useTheme } from '../theme/useTheme';
import { Image } from 'expo-image';
import { useState } from 'react';
import Animated, { FadeIn, FadeInDown, FadeInLeft, FadeInRight, FadeInUp, FadeOutDown, FadeOutLeft, FadeOutRight, FadeOutUp, SlideInDown, SlideInRight, SlideOutRight } from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import React from 'react';
import { fS } from '../theme/theme';
import { useAppStorage } from '../../appStorageProvider';

const windowHeight = Dimensions.get('window').height;
const windowWidth = Dimensions.get('window').width;

export default function MainMenu({ page, navigate }) {
  const theme = useTheme();
  const { monthOffset, toggleMonthOffset } = useAppStorage();

  const [menuOpen, setMenuOpen] = useState(false);

  const buttons = [
    { name: 'home', label: 'Inicio' },
    { name: 'monthly_summary', label: 'Resumen mensual' },
    { name: 'subscriptions', label: 'Suscripciones' },

    // { name: 'fixed_expenses', label: 'Gastos fijos' },
    // { name: 'planned_expenses', label: 'Gastos planificados' },
    { name: 'matias_accounts', label: 'Cuentas de Matías' },
    { name: 'toggle_month', label: monthOffset === 0 ? 'Ir al mes siguiente' : 'Ir al mes actual' },
  ];

  const visibleButtons = page === 'home' ? buttons.filter((btn) => btn.name !== 'home') : buttons;

  return (
    <>
      {menuOpen && (
        <Animated.View
          entering={SlideInRight.duration(200)}
          exiting={SlideOutRight.duration(200)}
          style={{
            position: 'absolute',
            bottom: windowWidth * 0.2,
            right: windowWidth * 0.05,
          }}
        >
          <BlurView
            intensity={40}
            style={{
              width: windowWidth * 0.5,
              height: visibleButtons.length * windowWidth * 0.12,
              borderRadius: 20,
              overflow: 'hidden',
            }}
          >
            {visibleButtons.map((btn, index) => {
              return (
                <React.Fragment key={index}>
                  {index > 0 && <View style={{ width: '100%', height: 1, backgroundColor: theme.bg.tr_3 }}></View>}
                  <Pressable
                    onPress={() => {
                      if (btn.name === 'toggle_month') {
                        toggleMonthOffset();
                        setMenuOpen(false);
                      } else {
                        navigate(btn.name, btn.name === 'home' ? 0 : 1);
                        setMenuOpen(false);
                      }
                    }}
                    style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: btn.name === 'toggle_month' && monthOffset !== 0 ? theme.bg.menuAccentColor : page === btn.name ? theme.bg.menuAccentColor : theme.bg.tr_1 }}
                  >
                    <Text style={{ color: theme.text._2, fontSize: fS.mainMenu }}>{btn.label}</Text>
                  </Pressable>
                </React.Fragment>
              );
            })}
          </BlurView>
        </Animated.View>
      )}
      <Pressable
        onPress={() => setMenuOpen((prev) => !prev)}
        style={{
          position: 'absolute',
          width: windowWidth * 0.12,
          height: windowWidth * 0.12,
          backgroundColor: theme.bg.tr_1,
          bottom: windowWidth * 0.05,
          right: windowWidth * 0.05,
          borderRadius: 100,
          overflow: 'hidden',
        }}
      >
        <BlurView
          intensity={40}
          style={{
            width: '100%',
            height: '100%',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          {!menuOpen ? (
            <Animated.View key={'one'} entering={FadeInLeft.duration(200)} exiting={FadeOutLeft.duration(200)} style={{ width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}>
              <Image source={require('../../assets/icons/menu.png')} style={{ width: '42%', aspectRatio: 1 / 1, opacity: 0.8 }}></Image>
            </Animated.View>
          ) : (
            <Animated.View key={'two'} entering={FadeInRight.duration(200)} exiting={FadeOutRight.duration(200)} style={{ width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}>
              <Image source={require('../../assets/icons/x.png')} style={{ width: '58%', aspectRatio: 1 / 1, opacity: 0.8 }}></Image>
            </Animated.View>
          )}
        </BlurView>
      </Pressable>
      {page !== 'home' && (
        <Animated.View
          entering={FadeInLeft.duration(200)}
          exiting={FadeOutLeft.duration(200)}
          style={{
            bottom: windowWidth * 0.05,
            right: windowWidth * 0.19,
            position: 'absolute',
          }}
        >
          <Pressable
            onPress={() => {
              (navigate('home', 0), setMenuOpen(false));
            }}
            style={{
              width: windowWidth * 0.12,
              height: windowWidth * 0.12,
              backgroundColor: theme.bg.tr_1,

              borderRadius: 100,
              overflow: 'hidden',
            }}
          >
            <BlurView
              intensity={40}
              style={{
                width: '100%',
                height: '100%',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Animated.View key={'one'} style={{ width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}>
                <Image source={require('../../assets/icons/home.png')} style={{ width: '50%', aspectRatio: 1 / 1, opacity: 0.8, marginBottom: 1 }}></Image>
              </Animated.View>
            </BlurView>
          </Pressable>
        </Animated.View>
      )}
    </>
  );
}
