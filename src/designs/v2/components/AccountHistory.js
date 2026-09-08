import { useMemo } from 'react';
import { View, Text, Dimensions, Pressable } from 'react-native';
import Animated, { FadeIn, FadeInDown, SlideInDown, SlideOutDown } from 'react-native-reanimated';
import { useTheme } from '../../../theme/useTheme';
import { useData } from '../../../../context';
import { categories } from '../../../../data.js';
import { fS } from '../../../theme/theme.js';
import FadingScroll from './FadingScroll.js';

const MONTHS_SHORT = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

// las transacciones traen Timestamp de firestore, pero una recién escrita puede
// llegar con la fecha todavía sin resolver
const shortDate = (value) => {
  const date = value?.toDate ? value.toDate() : value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return '';
  return `${date.getDate()} ${MONTHS_SHORT[date.getMonth()]}`;
};

// Lista de movimientos de una cuenta, para el espacio de abajo de la tarjeta.
// Ocupa el mismo lugar que el teclado, así que los dos no conviven.
export default function AccountHistory({ account, onClose }) {
  const theme = useTheme();
  const { transactions } = useData();
  const windowWidth = Dimensions.get('window').width;
  const windowHeight = Dimensions.get('window').height;

  const rows = useMemo(() => [...transactions.filter((t) => t.accountId === account.id)].sort((a, b) => (b.date?.seconds || 0) - (a.date?.seconds || 0)), [transactions, account.id]);

  return (
    <Animated.View entering={SlideInDown} exiting={SlideOutDown} style={{ position: 'absolute', left: 0, top: windowHeight * 0.47, width: windowWidth, height: windowHeight * 0.53, paddingHorizontal: windowWidth * 0.05 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 10 }}>
        <Text style={{ color: theme.text._3, fontSize: fS.mSummarySubtitle }}>Movimientos</Text>
        <Pressable onPress={onClose} style={{ backgroundColor: theme.bg.tr_1, borderRadius: 15, height: windowWidth * 0.09, paddingHorizontal: 20, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: theme.text._2, fontWeight: 500, fontSize: fS.keyboardBtn }}>Volver</Text>
        </Pressable>
      </View>

      {rows.length === 0 ? (
        <Animated.Text entering={FadeIn} style={{ color: theme.text._3, fontSize: fS.subsText, paddingVertical: 20 }}>
          Sin movimientos todavía.
        </Animated.Text>
      ) : (
        <FadingScroll>
          <View style={{ gap: 5, paddingBottom: windowHeight * 0.02 }}>
            {rows.map((tx, index) => {
              const category = categories[tx.category];
              const isIncome = tx.type === 'income';

              return (
                <Animated.View
                  key={tx.id}
                  entering={FadeInDown.delay(index * 30)}
                  style={{ backgroundColor: theme.bg.tr_05, borderRadius: 10, height: windowWidth * 0.13, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 12 }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
                    <Text style={{ fontSize: fS.subsText }}>{tx.emoji || category?.emoji || '📦'}</Text>
                    <View style={{ flex: 1 }}>
                      <Text numberOfLines={1} style={{ color: theme.text._2, fontSize: fS.subsText }}>
                        {tx.label || category?.label || 'Movimiento'}
                      </Text>
                      <Text style={{ color: theme.text._3, fontSize: fS.keyboardBtn * 0.8 }}>{[shortDate(tx.date), category?.label].filter(Boolean).join(' · ')}</Text>
                    </View>
                  </View>
                  <Text style={{ color: isIncome ? theme.text.green : theme.text.red, fontSize: fS.subsText }}>{`${isIncome ? '+' : '-'}$${Number(tx.amount).toLocaleString('es-CL')}`}</Text>
                </Animated.View>
              );
            })}
          </View>
        </FadingScroll>
      )}
    </Animated.View>
  );
}
