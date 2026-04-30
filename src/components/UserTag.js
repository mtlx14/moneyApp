import { Dimensions, Pressable, Text, View } from 'react-native';
import { useTheme } from '../theme/useTheme.js';
import { BlurView } from 'expo-blur';
import { useEffect, useState } from 'react';
import Animated, { FadeOutRight, LinearTransition, SlideInLeft, SlideOutLeft, SlideOutRight } from 'react-native-reanimated';
import React from 'react';
import { themes } from '../../data.js';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppStorage } from '../../appStorageProvider.js';
import { fS } from '../theme/theme.js';

export default function UserTag({}) {
  const windowHeight = Dimensions.get('window').height;
  const windowWidth = Dimensions.get('window').width;
  const { currentUser, updateTheme, setCurrentUser } = useAppStorage();
  const theme = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [themesOpen, setThemesOpen] = useState(false);
  const themeItemsForRow = 3;
  const [modal_1_exitRight, setModal_1_exitRight] = useState(false);

  const buttons = [
    { name: 'change_user', label: 'Cambiar usuario' },
    { name: 'change_theme', label: 'Cambiar Tema' },
  ];

  const name_text = currentUser.name === 'matias' ? '🚀  Matias' : '🌸  Aylin';

  const handleOnPressUserTag = () => {
    if (menuOpen || themesOpen) {
      setMenuOpen(false);
      setThemesOpen(false);
      setModal_1_exitRight(false);
    } else {
      setMenuOpen(true);
    }
  };

  const handleOnPressModal_1 = ({ btn }) => {
    if (btn === 'change_theme') {
      setModal_1_exitRight(true);
    }
    if (btn === 'change_user') {
      const newUser = currentUser.name === 'matias' ? 'aylin' : 'matias';
      setCurrentUser(newUser);
      setMenuOpen(false);
      setThemesOpen(false);
    }
  };

  useEffect(() => {
    if (modal_1_exitRight) {
      setMenuOpen(false);
      setThemesOpen(true);
    } else {
      setThemesOpen(false);
    }
  }, [modal_1_exitRight]);
  return (
    <>
      {menuOpen && (
        <Animated.View
          entering={SlideInLeft.duration(200)}
          exiting={modal_1_exitRight ? FadeOutRight.duration(200) : SlideOutLeft.duration(200)}
          style={{
            position: 'absolute',
            top: windowWidth * 0.07 + 30,
            left: 19,
          }}
        >
          <BlurView
            intensity={40}
            style={{
              width: windowWidth * 0.5,
              height: buttons.length * windowWidth * 0.12,
              borderRadius: 12,
              overflow: 'hidden',
            }}
          >
            {buttons.map((btn, index) => {
              return (
                <React.Fragment key={index}>
                  {index > 0 && <View style={{ width: '100%', height: 1, backgroundColor: theme.bg.tr_1 }}></View>}
                  <Pressable
                    onPress={() => {
                      handleOnPressModal_1({ btn: btn.name });
                    }}
                    style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
                  >
                    <Text style={{ color: theme.text._2, fontSize: fS.userTagName }}>{btn.label}</Text>
                  </Pressable>
                </React.Fragment>
              );
            })}
          </BlurView>
        </Animated.View>
      )}
      {themesOpen && (
        <Animated.View
          entering={SlideInLeft.duration(200)}
          exiting={SlideOutLeft.duration(200)}
          style={{
            position: 'absolute',
            top: windowWidth * 0.07 + 30,
            left: 19,
          }}
        >
          <BlurView
            intensity={20}
            style={{
              borderRadius: 20,
              overflow: 'hidden',
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                padding: 15,
                gap: 15,
                backgroundColor: theme.bg.tr_3,
                width: windowWidth * 0.6,
                flexWrap: 'wrap',
              }}
            >
              {Object.values(themes).map((t, index) => {
                return (
                  <React.Fragment key={index}>
                    <Pressable
                      onPress={() => {
                        updateTheme(t.name);
                        setModal_1_exitRight(false);
                      }}
                      style={{}}
                    >
                      <LinearGradient
                        colors={[t.bg.primary_2, t.bg.primary]}
                        start={{ x: 0.2, y: 1 }}
                        end={{ x: 0, y: 0 }}
                        style={{ width: (windowWidth * 0.6 - 15 * (themeItemsForRow + 1)) / themeItemsForRow, height: (windowWidth * 0.6 - 15 * (themeItemsForRow + 1)) / themeItemsForRow, borderRadius: 10 }}
                        locations={[0, 1]}
                      ></LinearGradient>
                    </Pressable>
                  </React.Fragment>
                );
              })}
            </View>
          </BlurView>
        </Animated.View>
      )}
      <View style={{ position: 'absolute', top: 20, left: 20, height: windowWidth * 0.07 }}>
        <Pressable onPress={() => handleOnPressUserTag()} style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.bg.tr_1, borderRadius: 10 }}>
          <Text style={{ color: theme.text._1, paddingLeft: 12, paddingRight: 15, fontSize: fS.userTagName }}>{name_text}</Text>
        </Pressable>
      </View>
    </>
  );
}
