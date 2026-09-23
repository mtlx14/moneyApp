import { useEffect, useRef, useState } from 'react';
import { Dimensions, Keyboard as RNKeyboard, Platform, Pressable, Text, TextInput, View } from 'react-native';
import Animated, { FadeInDown, LinearTransition, SlideInRight, SlideOutRight } from 'react-native-reanimated';
import { useTheme } from '../../../theme/useTheme';
import { fS } from '../../../theme/theme.js';
import { confirmDelete } from '../../../helpers.js';
import Icon from './Icon.js';
import Caret from './Caret.js';
import { Keyboard as CustomKeyboard } from './Keyboard.js';

// la descripción arranca en mayúscula, igual que en el modal de movimientos
const capitalize = (text) => (text ? text.charAt(0).toUpperCase() + text.slice(1) : text);

// un día del mes: el teclado deja escribir cualquier cosa, acá se recorta
const toDay = (value) => Math.min(31, Math.max(0, Number(value) || 0));

// Alta y edición de una tarjeta de crédito, con la misma caja de filas que el
// modal de movimientos. Los días de facturación y pago sugieren el mes de la
// primera cuota al anotar una compra (ver suggestedFirstInstallmentIndex en
// helpers.js)
export default function ModalCard({ card, onCancel, onSave, onDelete, setShowMenu }) {
  // congeladas al montar, como en el modal de movimientos: el teclado del
  // navegador achica la ventana mientras se escribe
  const [{ width: windowWidth, height: windowHeight }] = useState(() => Dimensions.get('window'));
  const theme = useTheme();

  const [draft, setDraft] = useState(() => ({ name: card.name || '', billingDay: card.billingDay || 1, paymentDay: card.paymentDay || 1 }));
  // qué día se está escribiendo con el teclado de la app: 'billingDay' | 'paymentDay' | null
  const [dayField, setDayField] = useState(null);
  const [inputFocused, setInputFocused] = useState(false);
  const openTimer = useRef(null);

  useEffect(() => {
    if (!setShowMenu) return;
    setShowMenu(false);
    return () => setShowMenu(true);
  }, []);

  useEffect(() => () => clearTimeout(openTimer.current), []);

  const dismissSystemKeyboard = () => {
    if (Platform.OS === 'web') document.activeElement?.blur?.();
    else RNKeyboard.dismiss();
  };

  // el teclado nativo tarda en cerrarse: si el de la app se monta antes, queda mal puesto
  const openDayKeyboard = (field) => {
    clearTimeout(openTimer.current);
    const wasOpen = inputFocused;
    dismissSystemKeyboard();
    if (wasOpen) openTimer.current = setTimeout(() => setDayField(field), 400);
    else setDayField(field);
  };

  const closeAll = () => {
    clearTimeout(openTimer.current);
    setDayField(null);
    dismissSystemKeyboard();
  };

  const isComplete = !!draft.name.trim() && draft.billingDay >= 1 && draft.paymentDay >= 1;
  const hasChanges = !card.id || draft.name.trim() !== (card.name || '').trim() || draft.billingDay !== card.billingDay || draft.paymentDay !== card.paymentDay;
  const somethingOpen = !!dayField || inputFocused;

  const rows = [
    { field: 'name', label: 'Nombre' },
    { field: 'billingDay', label: 'Facturación' },
    { field: 'paymentDay', label: 'Pago' },
  ];

  const rowHeight = windowWidth * 0.12;
  const boxHeight = rows.length * rowHeight + (rows.length - 1);
  const closedHeight = boxHeight + 10 + windowWidth * 0.08;
  const topOffset = (windowHeight * 0.6 - closedHeight) / 2;

  return (
    <Animated.View entering={FadeInDown.duration(150).delay(150)} style={{ position: 'absolute', width: windowWidth, height: windowHeight, top: 0, left: 0 }}>
      {/* un toque fuera de la caja cierra lo que esté abierto y, si no hay nada, el modal */}
      <Pressable onPress={() => (somethingOpen ? closeAll() : onCancel())} style={{ position: 'absolute', top: 0, left: 0, width: windowWidth, height: windowHeight }} />

      <View style={{ width: windowWidth, height: windowHeight * 0.6, alignItems: 'center', paddingTop: topOffset }} pointerEvents='box-none'>
        <View style={{ width: windowWidth * 0.8, borderRadius: 20, overflow: 'hidden' }}>
          {rows.map((row, index) => (
            <View key={row.field}>
              {index > 0 && <View style={{ width: '100%', height: 1, backgroundColor: theme.bg.tr_3 }} />}
              <View style={{ height: rowHeight, backgroundColor: theme.bg.tr_05, flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ backgroundColor: theme.bg.tr_05, height: '100%', justifyContent: 'center', paddingLeft: 15, paddingRight: 10, width: '35%' }}>
                  <Text style={{ color: theme.text._2, fontSize: fS.modalTransfer }}>{`${row.label}:`}</Text>
                </View>

                {row.field === 'name' ? (
                  <TextInput
                    value={draft.name}
                    onChangeText={(text) => setDraft((prev) => ({ ...prev, name: capitalize(text) }))}
                    onFocus={() => (clearTimeout(openTimer.current), setDayField(null), setInputFocused(true))}
                    onBlur={() => setInputFocused(false)}
                    autoCapitalize='sentences'
                    keyboardAppearance='dark'
                    placeholder='Tarjeta Matías'
                    placeholderTextColor={theme.text._4}
                    style={{ color: theme.text._1, fontSize: fS.modalTransfer, paddingLeft: 10, flex: 1, height: '100%' }}
                  />
                ) : (
                  <Pressable onPress={() => openDayKeyboard(row.field)} style={{ flex: 1, height: '100%', flexDirection: 'row', alignItems: 'center', paddingLeft: 10 }}>
                    <Text style={{ color: draft[row.field] ? theme.text._1 : theme.text._4, fontSize: fS.modalTransfer }}>{draft[row.field] ? `Día ${draft[row.field]}` : 'Elegir día'}</Text>
                    {dayField === row.field && <Caret height={fS.modalTransfer * 1.2} />}
                  </Pressable>
                )}
              </View>
            </View>
          ))}
        </View>

        {/* botones, igual que en el modal de movimientos */}
        <Animated.View layout={LinearTransition} pointerEvents={somethingOpen ? 'none' : 'auto'} style={{ width: windowWidth * 0.8, marginTop: 10, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          {!!card.id && (
            <Pressable
              onPress={() => confirmDelete({ title: 'Eliminar tarjeta', message: `¿Eliminar "${card.name}" y todas sus compras?`, onConfirm: () => onDelete(card) })}
              style={{ backgroundColor: theme.bg.danger, borderRadius: 100, height: windowWidth * 0.08, width: windowWidth * 0.1, justifyContent: 'center', alignItems: 'center' }}
            >
              <Icon name='delete' size={windowWidth * 0.045} color={theme.text.onFill} />
            </Pressable>
          )}

          <View style={{ flex: 1 }} />

          <Animated.View layout={LinearTransition}>
            <Pressable onPress={onCancel} style={{ backgroundColor: theme.bg.tr_2, borderRadius: 100, height: windowWidth * 0.08, justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ color: theme.text._1, fontSize: fS.modalTransfer, paddingHorizontal: 20 }}>Cerrar</Text>
            </Pressable>
          </Animated.View>

          {isComplete && hasChanges && (
            <Animated.View layout={LinearTransition} entering={SlideInRight} exiting={SlideOutRight}>
              <Pressable onPress={() => onSave({ ...card, ...draft })} style={{ backgroundColor: theme.bg.check, borderRadius: 100, height: windowWidth * 0.08, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ color: theme.text.onFill, fontSize: fS.modalTransfer, paddingHorizontal: 20 }}>Guardar</Text>
              </Pressable>
            </Animated.View>
          )}
        </Animated.View>
      </View>

      {/* el key rearma el teclado al pasar de un día al otro: arranca con el valor de esa fila */}
      {dayField && (
        <CustomKeyboard
          key={dayField}
          initialValue={String(draft[dayField] || 0)}
          onChange={(nextValue) => setDraft((prev) => ({ ...prev, [dayField]: toDay(nextValue) }))}
          onConfirm={(nextValue) => {
            setDraft((prev) => ({ ...prev, [dayField]: toDay(nextValue) }));
            setDayField(null);
          }}
        />
      )}
    </Animated.View>
  );
}
