import { View, Dimensions, Pressable } from 'react-native';
import { useTheme } from '../../../theme/useTheme.js';
import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import Animated, { BounceIn, BounceOut, FlipInEasyX, ZoomIn, ZoomOut } from 'react-native-reanimated';
import { doc, increment, setDoc } from 'firebase/firestore';
import db from '../../../../conection.js';
import { useData } from '../../../../context.js';
import { useAppStorage } from '../../../../appStorageProvider.js';
import { updateChanges } from '../../../services.js';
import { billWeeks, isWeekly } from '../../../helpers.js';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

// Sirve para los gastos y para las tarjetas de crédito: las dos guardan isPaid
// en su documento, solo cambia la colección. Un gasto semanal no se marca acá:
// el toque abre sus semanas (onPress) y el check queda amarillo mientras falten
export default function CheckButton({ bill, collectionName = 'bills', onPress }) {
  const theme = useTheme();
  const [checked, setChecked] = useState(false);
  const [yellow, setYellow] = useState(false);
  const { bills } = useData();
  const { currentUser, monthOffset } = useAppStorage();

  const weekly = isWeekly(bill);
  const weeks = weekly ? billWeeks(bill, monthOffset) : [];
  const paidWeeks = weeks.filter((w) => w.paid).length;
  // las suscripciones van igual: amarillo mientras falte alguna, verde con todas
  const subs = bills.filter((b) => b.type === 'sub');
  const paidSubs = subs.filter((s) => s.isPaid).length;

  useEffect(() => {
    if (weekly) {
      setChecked(paidWeeks > 0);
      setYellow(paidWeeks > 0 && paidWeeks < weeks.length);
    } else if (bill.label !== 'Suscripciones') {
      if (bill.isPaid !== checked) setChecked(bill.isPaid);
      // por si dejó de ser semanal con semanas a medio marcar
      setYellow(false);
    } else {
      setChecked(paidSubs > 0);
      setYellow(paidSubs > 0 && paidSubs < subs.length);
    }
  }, [bill.isPaid, weekly, paidWeeks, weeks.length, paidSubs, subs.length]);

  const handleOnPress = () => {
    if (weekly) return onPress?.(bill);
    if (bill.label === 'Suscripciones') return;

    updateChanges({ user: currentUser.name, change: 'bills' });

    setDoc(
      doc(db, collectionName, bill.id),
      {
        isPaid: !checked,
      },
      { merge: true },
    );

    setChecked((prev) => !prev);
  };
  return (
    <Pressable onPress={() => handleOnPress()} style={{ height: windowWidth * 0.1 - 10, aspectRatio: 1 / 1, backgroundColor: checked ? (yellow ? theme.bg.yellow : theme.bg.check) : theme.bg.tr_1, borderRadius: 5, justifyContent: 'center', alignItems: 'center' }}>
      {checked && (
        <Animated.View entering={ZoomIn.duration(200)} exiting={ZoomOut.duration(200)} style={{ width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}>
          <Image source={require('../../../../assets/icons/check.png')} style={{ width: '60%', aspectRatio: 1 / 1 }}></Image>
        </Animated.View>
      )}
    </Pressable>
  );
}
