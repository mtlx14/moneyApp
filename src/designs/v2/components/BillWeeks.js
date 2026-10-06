import { Dimensions, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import Animated, { ZoomIn, ZoomOut } from 'react-native-reanimated';
import { Image } from 'expo-image';
import { useTheme } from '../../../theme/useTheme.js';
import { fS } from '../../../theme/theme.js';
import { useAppStorage } from '../../../../appStorageProvider.js';
import { useData } from '../../../../context.js';
import { WEEKDAY_NAMES, billWeeks } from '../../../helpers.js';
import { updateBillWeeks, updateChanges } from '../../../services.js';
import { CONTENT_LEFT } from '../layout.js';

// Las semanas de un gasto fijo semanal en el mes que se mira, armadas como el
// listado de cuentas: el nombre del gasto de título, una fila por cada vez que
// cae su día ("Martes 06") con su check, y el botón Volver al pie.
// Marcar todas deja el gasto pagado; mientras falte alguna, su check en Gastos
// queda amarillo. Se vuelve con el botón Volver o con el gesto de volver.
export default function BillWeeks({ billId, onBack }) {
  const { width: windowWidth, height: windowHeight } = Dimensions.get('window');
  const theme = useTheme();
  const { bills } = useData();
  const { currentUser, monthOffset } = useAppStorage();

  // se lee de bills y no de una copia: así cada check se ve apenas vuelve el documento
  const bill = bills.find((b) => b.id === billId);
  if (!bill) return null;

  const weeks = billWeeks(bill, monthOffset);

  const toggle = (week) => {
    const paid = bill.paidWeeks || [];
    const next = week.paid ? paid.filter((k) => k !== week.key) : [...paid, week.key];
    updateChanges({ user: currentUser.name, change: 'bills' });
    updateBillWeeks({ bill, paidWeeks: next, isPaid: weeks.every((w) => (w.key === week.key ? !week.paid : w.paid)) });
  };

  return (
    <ScrollView style={Platform.OS === 'web' ? { height: windowHeight, width: windowWidth } : undefined}>
      <View style={{ width: windowWidth, height: windowHeight * 0.1, justifyContent: 'flex-end', alignItems: 'center' }}>
        <Text style={{ color: theme.text._1, fontSize: fS.subsTitle, fontWeight: 400 }}>{bill.label}</Text>
      </View>
      <View style={{ width: windowWidth, paddingHorizontal: windowWidth * 0.05, paddingLeft: CONTENT_LEFT, gap: 5, marginTop: windowHeight * 0.025, paddingBottom: windowHeight * 0.015 }}>
        <Text style={{ color: theme.text._3, padding: 5, opacity: 0, fontSize: fS.mSummarySubtitle }}>a</Text>

        {weeks.map((week) => (
          <Pressable key={week.key} onPress={() => toggle(week)} style={{ width: '100%', backgroundColor: theme.bg.account, borderRadius: 10, height: windowWidth * 0.12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingLeft: 15, paddingRight: 10 }}>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Text style={{ fontSize: fS.subsText }}>{bill.emoji}</Text>
              <Text style={{ color: theme.text._2, fontSize: fS.subsText }}>{`${WEEKDAY_NAMES[bill.weekday]} ${String(week.date.getDate()).padStart(2, '0')}`}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 15 }}>
              <Text style={{ color: theme.text._2, fontSize: fS.subsText }}>{`$${bill.amount.toLocaleString('es-CL')}`}</Text>
              {/* el mismo cuadro que el check de Gastos */}
              <View style={{ height: windowWidth * 0.1 - 10, aspectRatio: 1, backgroundColor: week.paid ? theme.bg.check : theme.bg.tr_1, borderRadius: 5, justifyContent: 'center', alignItems: 'center' }}>
                {week.paid && (
                  <Animated.View entering={ZoomIn.duration(200)} exiting={ZoomOut.duration(200)} style={{ width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}>
                    <Image source={require('../../../../assets/icons/check.png')} style={{ width: '60%', aspectRatio: 1 }} />
                  </Animated.View>
                )}
              </View>
            </View>
          </Pressable>
        ))}
      </View>
      {/* donde las cuentas tienen el Total */}
      <Pressable onPress={onBack} style={{ marginRight: 20, alignSelf: 'flex-end', backgroundColor: theme.bg.tr_2, borderRadius: 100, height: windowWidth * 0.09, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: theme.text._1, fontSize: fS.modalTransfer, paddingHorizontal: 20 }}>Volver</Text>
      </Pressable>
      <View style={{ width: 100, height: windowHeight * 0.3 }}></View>
    </ScrollView>
  );
}
