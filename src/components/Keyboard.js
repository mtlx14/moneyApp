import { useState } from 'react';
import { View, Text, Pressable, Dimensions } from 'react-native';
import { useTheme } from '../theme/useTheme';
import Animated, { FadeInDown, FadeOutUp, SlideInDown, SlideInUp, SlideOutDown } from 'react-native-reanimated';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fS } from '../theme/theme';

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '000', '0', '⌫'];
export function Keyboard({ initialValue = '0', onChange, onConfirm, onCancel = null, onDelete = null, showCancel = false, showDelete = false, onTransfer = null }) {
  const insets = useSafeAreaInsets();
  const windowWidth = Dimensions.get('window').width;
  const windowHeight = Dimensions.get('window').height - insets.top;
  const theme = useTheme();
  const [value, setValue] = useState(String(initialValue));
  const [firstKeyPressed, setFirstKeyPressed] = useState(false);

  const handleKeyPress = (key) => {
    setValue((prev) => {
      let next = prev;
      if (key === 'confirm') {
        onConfirm?.(next);
        return next;
      }
      if (key === 'cancel') {
        onCancel?.();
        return next;
      }
      if (key === 'delete') {
        onDelete?.();
        return next;
      }
      if (key === 'transfer') {
        onTransfer?.();
        return next;
      }

      if (key === '⌫') {
        next = prev.length > 1 ? prev.slice(0, -1) : '0';
      } else if (key === '000') {
        next = prev === '0' ? `0` : prev + '000';
      } else {
        next = !firstKeyPressed ? key : prev === '0' ? key : prev + key;
      }
      onChange?.(next);
      return next;
    });
    if (!firstKeyPressed) {
      setFirstKeyPressed(true);
    }
  };

  const rowsToRender = [];
  for (let i = 0; i < 4; i++) {
    const rowKeys = [];
    for (let j = 0; j < 3; j++) {
      const key = KEYS[i * 3 + j];
      rowKeys.push(
        <Pressable
          key={key}
          onPress={() => handleKeyPress(key)}
          onLongPress={() => {
            if (key === '⌫') {
              setValue('0');
              onChange?.('0');
            }
          }}
          delayLongPress={150}
          onContextMenu={(e) => e.preventDefault()}
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: theme.bg.keyboard_key,
            borderRadius: 15,
            userSelect: 'none',
            WebkitUserSelect: 'none',
            WebkitTouchCallout: 'none',
            touchAction: 'manipulation',
          }}
        >
          <Text style={{ fontSize: fS.keyboardKey, color: theme.text._2, fontWeight: '300', userSelect: 'none' }}>{key}</Text>
        </Pressable>,
      );
    }
    rowsToRender.push(
      <View key={i} style={{ flexDirection: 'row', flex: 1, gap: 5 }}>
        {rowKeys}
      </View>,
    );
  }

  return (
    <Animated.View entering={SlideInDown} exiting={SlideOutDown} style={{ backgroundColor: theme.bg.keyboard, position: 'absolute', width: windowWidth, height: windowHeight * 0.35, top: windowHeight * 0.65, borderTopRightRadius: 20, borderTopLeftRadius: 20 }}>
      <View style={{ height: windowHeight * 0.3, gap: 5, padding: 5 }}>{rowsToRender}</View>
      <Pressable
        onPress={() => handleKeyPress(showCancel ? 'cancel' : 'confirm')}
        style={{
          position: 'absolute',
          width: windowWidth * 0.25,
          top: -windowWidth * 0.09 - 5,
          right: 5,
          backgroundColor: showCancel ? theme.bg.red : theme.bg.blue,
          height: windowWidth * 0.09,
          borderRadius: 15,
          justifyContent: 'center',
          alignItems: 'center',
          userSelect: 'none',
        }}
      >
        {showCancel ? (
          <Animated.Text key={'cancel'} entering={FadeInDown.duration(100)} exiting={FadeOutUp.duration(100)} style={{ color: theme.text._1, fontWeight: 400, fontSize: fS.keyboardBtn }}>
            Cancelar
          </Animated.Text>
        ) : (
          <Animated.Text key={'confirm'} entering={FadeInDown.duration(100)} exiting={FadeOutUp.duration(100)} style={{ color: theme.text._1, fontWeight: 400, fontSize: fS.keyboardBtn }}>
            Confirmar
          </Animated.Text>
        )}
      </Pressable>

      {showDelete && (
        <>
          <Pressable
            onPress={() => handleKeyPress('delete')}
            style={{
              position: 'absolute',
              width: windowWidth * 0.12,
              top: -windowWidth * 0.09 - 5,
              right: 10 + windowWidth * 0.25,
              backgroundColor: theme.bg.red,
              height: windowWidth * 0.09,
              borderRadius: 15,
              justifyContent: 'center',
              alignItems: 'center',

              userSelect: 'none',
            }}
          >
            <Image style={{ width: windowWidth * 0.06, aspectRatio: 1 / 1, opacity: 0.9 }} source={require('../../assets/icons/trash.png')}></Image>
          </Pressable>
          <Pressable
            onPress={() => handleKeyPress('transfer')}
            style={{
              position: 'absolute',
              width: windowWidth * 0.63 - 20,
              top: -windowWidth * 0.09 - 5,
              left: 5,
              backgroundColor: theme.bg.tr_05,
              height: windowWidth * 0.09,
              borderRadius: 15,
              justifyContent: 'center',
              alignItems: 'center',
              userSelect: 'none',
              flexDirection: 'row',
              gap: 10,
            }}
          >
            <Image style={{ width: windowWidth * 0.035, aspectRatio: 1 / 1, opacity: 0.9 }} source={require('../../assets/icons/transfer.png')}></Image>
            <Text style={{ color: theme.text._2, fontWeight: 500, fontSize: fS.keyboardBtn }}>Mover a otra cuenta</Text>
          </Pressable>
        </>
      )}
    </Animated.View>
  );
}
