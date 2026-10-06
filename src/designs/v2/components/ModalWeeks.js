import { useEffect } from 'react';
import { Dimensions, Pressable, Text, View } from 'react-native';
import Animated, { FadeIn, FadeOut, ZoomIn, ZoomOut } from 'react-native-reanimated';
import { Image } from 'expo-image';
import { useTheme } from '../../../theme/useTheme.js';
import { fS } from '../../../theme/theme.js';
import { useAppStorage } from '../../../../appStorageProvider.js';
import { useData } from '../../../../context.js';
import { WEEKDAY_NAMES, billWeeks } from '../../../helpers.js';
import { updateBillWeeks, updateChanges } from '../../../services.js';

// Las semanas de un gasto fijo semanal en el mes que se mira, una fila por cada
// vez que cae su día ("Martes 06"), cada una con su check. Marcar todas deja el
// gasto pagado; mientras falte alguna, su check en Gastos queda amarillo. Un
// toque fuera cierra.
export default function ModalWeeks({ billId, onClose, setShowMenu }) {
  const { width: windowWidth, height: windowHeight } = Dimensions.get('window');
  const theme = useTheme();
  const { bills } = useData();
  const { currentUser, monthOffset } = useAppStorage();

  // el menú estorba en el modal, se esconde mientras está abierto
  useEffect(() => {
    if (!setShowMenu) return;
    setShowMenu(false);
    return () => setShowMenu(true);
  }, []);

  // se lee de bills y no de una copia: así cada check se ve apenas vuelve el documento
  const bill = bills.find((b) => b.id === billId);
  if (!bill) return null;

  const weeks = billWeeks(bill, monthOffset);
  const rowHeight = windowWidth * 0.12;

  const toggle = (week) => {
    const paid = bill.paidWeeks || [];
    const next = week.paid ? paid.filter((k) => k !== week.key) : [...paid, week.key];
    updateChanges({ user: currentUser.name, change: 'bills' });
    updateBillWeeks({ bill, paidWeeks: next, isPaid: weeks.every((w) => (w.key === week.key ? !week.paid : w.paid)) });
  };

  return (
    <Animated.View entering={FadeIn.duration(150)} exiting={FadeOut.duration(150)} style={{ position: 'absolute', top: 0, left: 0, width: windowWidth, height: windowHeight, justifyContent: 'center', alignItems: 'center' }}>
      <Pressable onPress={onClose} style={{ position: 'absolute', top: 0, left: 0, width: windowWidth, height: windowHeight, backgroundColor: theme.bg.black_tr_2 }} />

      <View style={{ width: windowWidth * 0.8 }}>
        <View style={{ flexDirection: 'row', gap: 10, paddingHorizontal: 15, paddingBottom: 10 }}>
          <Text style={{ fontSize: fS.subsText }}>{bill.emoji}</Text>
          <Text style={{ color: theme.text._1, fontSize: fS.subsText }}>{bill.label}</Text>
        </View>

        <View style={{ borderRadius: 20, overflow: 'hidden', backgroundColor: theme.bg.primary }}>
          {weeks.map((week, index) => (
            <View key={week.key}>
              {index > 0 && <View style={{ width: '100%', height: 1, backgroundColor: theme.bg.tr_3 }} />}
              <Pressable onPress={() => toggle(week)} style={{ height: rowHeight, backgroundColor: theme.bg.tr_05, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingLeft: 15, paddingRight: 10 }}>
                <Text style={{ color: theme.text._1, fontSize: fS.modalTransfer }}>{`${WEEKDAY_NAMES[bill.weekday]} ${String(week.date.getDate()).padStart(2, '0')}`}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 15 }}>
                  <Text style={{ color: theme.text._2, fontSize: fS.modalTransfer }}>{`$${bill.amount.toLocaleString('es-CL')}`}</Text>
                  <View style={{ height: rowHeight - 10, aspectRatio: 1, backgroundColor: week.paid ? theme.bg.check : theme.bg.tr_1, borderRadius: 5, justifyContent: 'center', alignItems: 'center' }}>
                    {week.paid && (
                      <Animated.View entering={ZoomIn.duration(200)} exiting={ZoomOut.duration(200)} style={{ width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}>
                        <Image source={require('../../../../assets/icons/check.png')} style={{ width: '60%', aspectRatio: 1 }} />
                      </Animated.View>
                    )}
                  </View>
                </View>
              </Pressable>
            </View>
          ))}
        </View>

        <Pressable onPress={onClose} style={{ alignSelf: 'flex-end', marginTop: 10, backgroundColor: theme.bg.tr_2, borderRadius: 100, height: windowWidth * 0.08, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: theme.text._1, fontSize: fS.modalTransfer, paddingHorizontal: 20 }}>Cerrar</Text>
        </Pressable>
      </View>
    </Animated.View>
  );
}
