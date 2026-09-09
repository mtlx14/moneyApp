import { useMemo } from 'react';
import Icon from './Icon.js';
import SwipeToDelete from './SwipeToDelete.js';
import { View, Text, Dimensions, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useTheme } from '../../../theme/useTheme';
import { useData } from '../../../../context';
import { deleteTransaction } from '../../../services.js';
import { txTypes } from '../../../../data.js';
import { fS } from '../../../theme/theme.js';
import FadingScroll from './FadingScroll.js';
import NewTxSwipe from './NewTxSwipe.js';
import { confirmDelete, isRideAccount, signedAmountFor } from '../../../helpers.js';
import { CARD_RATIO, WIDE_CARD_ASPECT, WIDE_CARD_TOP } from './AccountCard.js';

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
export default function AccountHistory({ account, onSelect, onNew }) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { transactions, categories } = useData();
  const windowWidth = Dimensions.get('window').width;
  const windowHeight = Dimensions.get('window').height;
  // arranca justo debajo de la tarjeta, calculado con sus mismas medidas
  const listTop = windowHeight * WIDE_CARD_TOP + (windowWidth * CARD_RATIO) / WIDE_CARD_ASPECT;

  // la barra de abajo es fija: la lista termina justo arriba de ella
  const barHeight = windowWidth * 0.14;
  const barBottom = insets.bottom + 10;
  const barSpace = barHeight + barBottom + 10;

  // las transferencias recibidas también son movimientos de esta cuenta, aunque
  // el documento viva en la de origen
  const rows = useMemo(() => [...transactions.filter((t) => t.accountId === account.id || t.toAccountId === account.id)].sort((a, b) => (b.date?.seconds || 0) - (a.date?.seconds || 0)), [transactions, account.id]);

  // Sin animación de salida: al cerrar la cuenta, el scroll del gesto todavía
  // está corrido, así que lo que se va se ve volver al centro antes de irse. Se
  // va de una y lo que anima es el listado entrando
  return (
    <>
      <Animated.View entering={FadeIn.duration(150)} style={{ position: 'absolute', left: 0, top: listTop, width: windowWidth, height: windowHeight - listTop - barSpace, paddingHorizontal: windowWidth * 0.05 }}>
        <Text style={{ color: theme.text._3, fontSize: fS.mSummarySubtitle, paddingTop: 10, paddingBottom: 8 }}>Movimientos</Text>
        {rows.length === 0 ? (
          <Text style={{ color: theme.text._3, fontSize: fS.subsText, paddingVertical: 20 }}>Sin movimientos todavía.</Text>
        ) : (
          <FadingScroll>
            <View style={{ gap: 5, paddingBottom: windowHeight * 0.02 }}>
              {rows.map((tx, index) => {
                // sin categoría (los saldos iniciales) el movimiento se muestra con su tipo
                const category = categories[tx.category] || txTypes[tx.type];
                const isPositive = signedAmountFor(tx, account.id) > 0;

                return (
                  // Sin animación propia: la ponía cada fila por separado y se
                  // veía reiniciarse la lista entera cada vez que se volvía de un
                  // movimiento. Además, con hijos animados reanimated no puede
                  // sacar el bloque de una sola pieza. Entran y salen con la caja
                  <View key={tx.id}>
                    <SwipeToDelete
                      width={windowWidth * 0.9}
                      height={windowWidth * 0.13}
                      onDelete={({ reset }) => confirmDelete({ title: 'Eliminar movimiento', message: `¿Estás seguro que quieres eliminar "${tx.label || 'este movimiento'}"?`, onConfirm: () => deleteTransaction({ tx }), onCancel: reset })}
                    >
                      <Pressable
                        onPress={() => onSelect(tx)}
                        style={{ backgroundColor: theme.bg.tr_05, borderRadius: 10, height: '100%', width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 12 }}
                      >
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
                          <View style={{ width: windowWidth * 0.09, height: windowWidth * 0.09, borderRadius: 9, backgroundColor: category?.color || '#8A8378', justifyContent: 'center', alignItems: 'center' }}>
                            <Icon name={category?.icon || 'inventory_2'} size={windowWidth * 0.05} color={theme.text.onFill} />
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text numberOfLines={1} style={{ color: theme.text._2, fontSize: fS.subsText }}>
                              {tx.label || category?.label || 'Movimiento'}
                            </Text>
                            <Text style={{ color: theme.text._3, fontSize: fS.keyboardBtn * 0.8 }}>{[shortDate(tx.date), category?.label].filter(Boolean).join(' · ')}</Text>
                          </View>
                        </View>
                        <Text style={{ color: isPositive ? theme.text.green : theme.text.red, fontSize: fS.subsText }}>{`${isPositive ? '+' : '-'}$${Number(tx.amount).toLocaleString('es-CL')}`}</Text>
                      </Pressable>
                    </SwipeToDelete>
                  </View>
                );
              })}
            </View>
          </FadingScroll>
        )}
      </Animated.View>

      {/* anotar un movimiento: se toca o se arrastra, fijo abajo */}
      <Animated.View entering={FadeIn.duration(150)} style={{ position: 'absolute', left: windowWidth * 0.05, bottom: barBottom }}>
        {/* en las cuentas de transporte todo es ingreso: el lado del gasto no
          se ofrece */}
        <NewTxSwipe height={barHeight} onNew={onNew} incomeOnly={isRideAccount(account)} />
      </Animated.View>
    </>
  );
}
