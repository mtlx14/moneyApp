import { View, Dimensions, Pressable } from 'react-native';
import { useTheme } from '../theme/useTheme.js';
import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import Animated, { BounceIn, BounceOut, FlipInEasyX, ZoomIn, ZoomOut } from 'react-native-reanimated';
import { doc, increment, setDoc } from 'firebase/firestore';
import db from '../../conection.js';
import { useData } from '../../context.js';
import { useAppStorage } from '../../appStorageProvider.js';
import { updateChanges } from '../services.js';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

export default function CheckButton({ bill }) {
  const theme = useTheme();
  const [checked, setChecked] = useState(false);
  const [yellow, setYellow] = useState(false);
  const { bills } = useData();
  const { currentUser } = useAppStorage();

  useEffect(() => {
    if (bill.label !== 'Suscripciones') {
      if (bill.isPaid !== checked) setChecked(bill.isPaid);
    } else {
      if (bills.filter((b) => b.type === 'sub').some((s) => s.isPaid)) {
        setChecked(true);
        setYellow(true);
      } else {
        setChecked(false);
        setYellow(false);
      }
    }
  }, [bill.isPaid]);

  const handleOnPress = () => {
    if (bill.label === 'Suscripciones') return;

    updateChanges({ user: currentUser.name, change: 'bills' });

    setDoc(
      doc(db, 'bills', bill.id),
      {
        isPaid: !checked,
      },
      { merge: true },
    );

    setChecked((prev) => !prev);
  };
  return (
    <Pressable onPress={() => handleOnPress()} style={{ height: windowWidth * 0.1 - 10, aspectRatio: 1 / 1, backgroundColor: checked ? (yellow ? theme.bg.yellow : theme.bg.green) : theme.bg.tr_1, borderRadius: 5, justifyContent: 'center', alignItems: 'center' }}>
      {checked && (
        <Animated.View entering={ZoomIn.duration(200)} exiting={ZoomOut.duration(200)} style={{ width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}>
          <Image source={require('../../assets/icons/check.png')} style={{ width: '60%', aspectRatio: 1 / 1 }}></Image>
        </Animated.View>
      )}
    </Pressable>
  );
}
