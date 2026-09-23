import { useEffect, useMemo, useRef, useState } from 'react';
import { Dimensions, Keyboard as RNKeyboard, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import Animated, { Easing, FadeInDown, LinearTransition, SlideInRight, SlideOutRight, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useTheme } from '../../../theme/useTheme';
import { useData } from '../../../../context';
import { fS } from '../../../theme/theme.js';
import { byLabelOtrosLast, confirmDelete, currentMonthIndex, firstInstallmentIndex, monthIndexLabel, suggestedFirstInstallmentIndex } from '../../../helpers.js';
import { deleteCardPurchase, saveCardPurchase } from '../../../services.js';
import Icon from './Icon.js';
import Caret from './Caret.js';
import { Keyboard as CustomKeyboard } from './Keyboard.js';
import DatePicker from './DatePicker.js';

const toDate = (value) => {
  const date = value?.toDate ? value.toDate() : value ? new Date(value) : null;
  return date && !Number.isNaN(date.getTime()) ? date : null;
};

const capitalize = (text) => (text ? text.charAt(0).toUpperCase() + text.slice(1) : text);

const pad = (n) => String(n).padStart(2, '0');
const shortDate = (date) => (date ? `${pad(date.getDate())}-${pad(date.getMonth() + 1)}-${date.getFullYear()}` : '—');

// Compra con tarjeta de crédito. Es el modal de movimientos sin tipo ni cuenta:
// todo es gasto y la tarjeta es la que está abierta. En su lugar lleva las
// cuotas, y el monto es el valor de **una** cuota, el que sale en el estado de
// cuenta. La fila de la primera cuota es la que ubica la compra en los meses.
// Nace con el mes sugerido por la fecha y los días de la tarjeta, y se cambia a
// mano, por ejemplo para las compras viejas, que ya van en alguna cuota
export default function ModalCardPurchase({ purchase, card, onCancel }) {
  const [{ width: windowWidth, height: windowHeight }] = useState(() => Dimensions.get('window'));
  const theme = useTheme();
  const { cardPurchases, categories } = useData();

  const [draft, setDraft] = useState(() => ({ label: purchase.label || '', amount: Number(purchase.amount) || 0, installments: Number(purchase.installments) || 1, category: purchase.category, date: toDate(purchase.date), firstMonthIndex: firstInstallmentIndex({ ...purchase, date: toDate(purchase.date) }, card) }));
  // si el mes se eligió a mano ya no se toca; si no, sigue a la fecha
  const [firstPicked, setFirstPicked] = useState(purchase.firstMonthIndex != null);

  // qué fila tiene la caja chica abierta: 'category' | 'first' | 'date' | null
  const [picking, setPicking] = useState(null);
  const [panelField, setPanelField] = useState(null);
  // qué número se escribe con el teclado de la app: 'amount' | 'installments' | null
  const [numberField, setNumberField] = useState(null);
  const [inputFocused, setInputFocused] = useState(false);

  // las descripciones ya usadas en compras, con la categoría que llevaron: elegir
  // una rellena las dos. Las más usadas arriba, una fila por descripción
  const savedSets = useMemo(() => {
    const map = new Map();
    cardPurchases.forEach((p) => {
      const label = (p.label || '').trim();
      if (!label || p.id === purchase.id) return;
      const key = label.toLowerCase();
      const found = map.get(key);
      if (found) found.count += 1;
      else map.set(key, { key, label, category: p.category, count: 1 });
    });
    return [...map.values()].sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
  }, [cardPurchases, purchase.id]);

  const query = draft.label.trim().toLowerCase();
  const matches = query ? savedSets.filter((set) => set.label.toLowerCase().includes(query)) : [];
  const showSuggestions = inputFocused && matches.length > 0;

  useEffect(() => {
    if (picking) setPanelField(picking);
  }, [picking]);

  const openTimer = useRef(null);
  const blurTimer = useRef(null);
  const focusState = useRef({ focused: false, blurredAt: 0 });
  useEffect(
    () => () => {
      clearTimeout(openTimer.current);
      clearTimeout(blurTimer.current);
    },
    [],
  );

  const dismissSystemKeyboard = () => {
    if (Platform.OS === 'web') document.activeElement?.blur?.();
    else RNKeyboard.dismiss();
  };

  const systemKeyboardOpen = () => {
    if (Platform.OS !== 'web') return RNKeyboard.isVisible();
    const { focused, blurredAt } = focusState.current;
    return focused || Date.now() - blurredAt < 400;
  };

  const inputFocusProps = {
    onFocus: () => {
      focusState.current = { focused: true, blurredAt: 0 };
      clearTimeout(blurTimer.current);
      setInputFocused(true);
      clearTimeout(openTimer.current);
      setNumberField(null);
      setPicking(null);
    },
    onBlur: () => {
      focusState.current = { focused: false, blurredAt: Date.now() };
      clearTimeout(blurTimer.current);
      blurTimer.current = setTimeout(() => setInputFocused(false), 150);
    },
  };

  const openNumberKeyboard = (field) => {
    clearTimeout(openTimer.current);
    setPicking(null);
    const wasOpen = systemKeyboardOpen();
    dismissSystemKeyboard();
    if (wasOpen) openTimer.current = setTimeout(() => setNumberField(field), 400);
    else setNumberField(field);
  };

  const openPicker = (field) => {
    clearTimeout(openTimer.current);
    setNumberField(null);
    dismissSystemKeyboard();
    setPicking((prev) => (prev === field ? null : field));
  };

  const closeAll = () => {
    clearTimeout(openTimer.current);
    setNumberField(null);
    setPicking(null);
    dismissSystemKeyboard();
  };

  const pickSet = (set) => {
    clearTimeout(blurTimer.current);
    clearTimeout(openTimer.current);
    setNumberField(null);
    setDraft((prev) => ({ ...prev, label: set.label, category: set.category ?? prev.category }));
    dismissSystemKeyboard();
    setInputFocused(false);
  };

  const isComplete = !!draft.label.trim() && Number(draft.amount) > 0 && draft.installments >= 1 && !!draft.category && !!draft.date;
  const hasChanges =
    !purchase.id ||
    draft.label.trim() !== (purchase.label || '').trim() ||
    Number(draft.amount) !== Number(purchase.amount || 0) ||
    draft.installments !== (Number(purchase.installments) || 1) ||
    draft.category !== purchase.category ||
    draft.date?.getTime() !== toDate(purchase.date)?.getTime() ||
    draft.firstMonthIndex !== firstInstallmentIndex(purchase, card);

  const somethingOpen = !!numberField || inputFocused || !!picking;

  const category = categories[draft.category];
  const firstMonth = monthIndexLabel(draft.firstMonthIndex);

  // cambiar la fecha rehace la sugerencia, mientras no se haya elegido a mano
  useEffect(() => {
    if (firstPicked) return;
    const suggested = suggestedFirstInstallmentIndex(draft, card);
    if (suggested !== draft.firstMonthIndex) setDraft((prev) => ({ ...prev, firstMonthIndex: suggested }));
  }, [draft.date?.getTime(), firstPicked]);

  // Los meses para la primera cuota: desde el mes siguiente al actual (o el
  // elegido, si va más adelante) hasta cuatro años atrás, que alcanza para las
  // compras viejas de 48 cuotas. El elegido no se repite, ya se lee en la fila
  const nowIndex = currentMonthIndex();
  const topIndex = Math.max(nowIndex + 1, draft.firstMonthIndex ?? nowIndex);
  const firstOptions = Array.from({ length: topIndex - nowIndex + 48 }, (_, i) => topIndex - i)
    .filter((index) => index !== draft.firstMonthIndex)
    .map((index) => ({ key: String(index), label: monthIndexLabel(index) }));

  // todo lo de la tarjeta es gasto: las de ingreso no se ofrecen
  const categoryOptions = Object.entries(categories)
    .filter(([key, c]) => key !== draft.category && c.kind !== 'income')
    .map(([key, c]) => ({ key, label: c.label, icon: c }))
    .sort(byLabelOtrosLast);

  const rows = [
    { field: 'label', label: 'Descripción' },
    { field: 'amount', label: 'Cuota' },
    { field: 'installments', label: 'Cuotas' },
    { field: 'category', label: 'Categoría', value: category?.label || '—', icon: category },
    { field: 'date', label: 'Fecha', value: shortDate(draft.date) },
    { field: 'first', label: '1ª cuota', value: firstMonth },
  ];

  const visibleRows = showSuggestions ? rows.filter((row) => row.field === 'label') : rows;

  const rowHeight = windowWidth * 0.12;
  const gap = 10;
  const edge = 20;
  const boxHeight = rows.length * rowHeight + (rows.length - 1);

  const panelWidth = windowWidth * 0.44;
  const panelOptions = panelField === 'category' ? categoryOptions : panelField === 'first' ? firstOptions : [];
  const panelHeight = Math.min(panelOptions.length * rowHeight + Math.max(0, panelOptions.length - 1), boxHeight);
  const panelRow = rows.findIndex((row) => row.field === panelField);
  const panelTop = Math.max(0, Math.min(panelRow > 0 ? panelRow * (rowHeight + 1) : 0, boxHeight - panelHeight));

  // la caja chica se funde desde la derecha y corre la grande, igual que en el
  // modal de movimientos
  const shift = windowWidth * 0.9 + gap + panelWidth - (windowWidth - edge);
  const panelTravel = 25;
  const duration = 180;
  const shiftProgress = useSharedValue(0);
  const panelProgress = useSharedValue(0);

  useEffect(() => {
    const to = picking && picking !== 'date' ? 1 : 0;
    shiftProgress.value = withTiming(to, { duration, easing: Easing.out(Easing.quad) });
    panelProgress.value = withTiming(to, { duration, easing: Easing.out(Easing.quad) });
  }, [picking]);

  const shiftStyle = useAnimatedStyle(() => ({ transform: [{ translateX: -shift * shiftProgress.value }] }));
  const panelStyle = useAnimatedStyle(() => ({ opacity: panelProgress.value, transform: [{ translateX: (1 - panelProgress.value) * panelTravel }] }));

  const closedHeight = boxHeight + 10 + windowWidth * 0.08;
  const topOffset = (windowHeight * 0.6 - closedHeight) / 2;

  const iconBadge = (icon) =>
    !!icon?.icon && (
      <View style={{ width: windowWidth * 0.07, height: windowWidth * 0.07, borderRadius: 7, backgroundColor: icon.color, justifyContent: 'center', alignItems: 'center' }}>
        <Icon name={icon.icon} size={windowWidth * 0.04} color={theme.text.onFill} />
      </View>
    );

  const pickList = (options, onPick) => (
    <View style={{ height: panelHeight, borderRadius: 20, overflow: 'hidden' }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {options.map((option, index) => (
          <View key={option.key}>
            {index > 0 && <View style={{ width: '100%', height: 1, backgroundColor: theme.bg.tr_3 }} />}
            <Pressable onPress={() => (onPick(option.key), setPicking(null))} style={{ height: rowHeight, backgroundColor: theme.bg.tr_05, flexDirection: 'row', alignItems: 'center', gap: 8, paddingLeft: 15 }}>
              {iconBadge(option.icon)}
              <Text numberOfLines={1} style={{ color: theme.text._1, fontSize: fS.modalTransfer, flex: 1 }}>
                {option.label}
              </Text>
            </Pressable>
          </View>
        ))}
      </ScrollView>
    </View>
  );

  const rowValue = (row) => {
    if (row.field === 'label') {
      return (
        <TextInput
          {...inputFocusProps}
          value={draft.label}
          onChangeText={(text) => setDraft((prev) => ({ ...prev, label: capitalize(text) }))}
          autoCapitalize='sentences'
          keyboardAppearance='dark'
          style={{ color: theme.text._1, fontSize: fS.modalTransfer, paddingLeft: 10, flex: 1, height: '100%' }}
        />
      );
    }

    if (row.field === 'amount' || row.field === 'installments') {
      const text = row.field === 'amount' ? `-$${Number(draft.amount).toLocaleString('es-CL')}` : `${draft.installments}`;
      return (
        <Pressable onPress={() => openNumberKeyboard(row.field)} style={{ flex: 1, height: '100%', flexDirection: 'row', alignItems: 'center', paddingLeft: 10 }}>
          <Text style={{ color: row.field === 'amount' ? theme.text.red : theme.text._1, fontSize: fS.modalTransfer }}>{text}</Text>
          {numberField === row.field && <Caret height={fS.modalTransfer * 1.2} />}
        </Pressable>
      );
    }

    return (
      <Pressable onPress={() => openPicker(row.field)} style={{ flex: 1, height: '100%', flexDirection: 'row', alignItems: 'center', gap: 8, paddingLeft: 10 }}>
        {iconBadge(row.icon)}
        <Text numberOfLines={1} style={{ color: theme.text._1, fontSize: fS.modalTransfer, flex: 1 }}>
          {row.value}
        </Text>
      </Pressable>
    );
  };

  return (
    <Animated.View entering={FadeInDown.duration(150).delay(150)} style={{ position: 'absolute', width: windowWidth, height: windowHeight, top: 0, left: 0 }}>
      <Pressable onPress={() => (somethingOpen ? closeAll() : onCancel())} style={{ position: 'absolute', top: 0, left: 0, width: windowWidth, height: windowHeight }} />

      <Animated.View layout={LinearTransition} entering={FadeInDown.duration(150).delay(150)} style={{ width: windowWidth, height: windowHeight * 0.6, justifyContent: 'flex-start', alignItems: 'center', paddingTop: topOffset }} pointerEvents='box-none'>
        <Animated.View style={[{ flexDirection: 'row', alignItems: 'flex-start' }, shiftStyle]}>
          <View style={{ width: windowWidth * 0.8, borderRadius: 20, overflow: 'hidden' }}>
            {visibleRows.map((row, index) => (
              <View key={row.field}>
                {index > 0 && <View style={{ width: '100%', height: 1, backgroundColor: theme.bg.tr_3 }} />}
                <View style={{ height: rowHeight, backgroundColor: theme.bg.tr_05, flexDirection: 'row', alignItems: 'center' }}>
                  <View style={{ backgroundColor: theme.bg.tr_05, height: '100%', justifyContent: 'center', paddingLeft: 15, paddingRight: 10, width: '35%' }}>
                    <Text style={{ color: theme.text._2, fontSize: fS.modalTransfer }}>{`${row.label}:`}</Text>
                  </View>
                  {rowValue(row)}
                </View>
              </View>
            ))}

            {showSuggestions && (
              <>
                <View style={{ width: '100%', height: 1, backgroundColor: theme.bg.tr_3 }} />
                <ScrollView keyboardShouldPersistTaps='always' style={{ height: boxHeight - rowHeight - 1, backgroundColor: theme.bg.tr_05 }}>
                  {matches.map((set, index) => (
                    <View key={set.key}>
                      {index > 0 && <View style={{ width: '100%', height: 1, backgroundColor: theme.bg.tr_3 }} />}
                      <Pressable onPressIn={() => pickSet(set)} onPress={() => pickSet(set)} style={{ height: rowHeight, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 15 }}>
                        {iconBadge(categories[set.category])}
                        <Text numberOfLines={1} style={{ color: theme.text._1, fontSize: fS.modalTransfer, flex: 1 }}>
                          {set.label}
                        </Text>
                      </Pressable>
                    </View>
                  ))}
                </ScrollView>
              </>
            )}
            {!!picking && <Pressable onPress={() => setPicking(null)} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} />}
          </View>

          <Animated.View pointerEvents={picking && picking !== 'date' ? 'auto' : 'none'} style={[{ position: 'absolute', left: windowWidth * 0.8 + gap, top: panelTop, width: panelWidth }, panelStyle]}>
            {panelField === 'category' && pickList(categoryOptions, (key) => setDraft((prev) => ({ ...prev, category: key })))}
            {panelField === 'first' && pickList(firstOptions, (key) => (setFirstPicked(true), setDraft((prev) => ({ ...prev, firstMonthIndex: Number(key) }))))}
          </Animated.View>
        </Animated.View>

        <Animated.View layout={LinearTransition} pointerEvents={somethingOpen ? 'none' : 'auto'} style={{ width: windowWidth * 0.8, marginTop: 10, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          {!!purchase.id && (
            <Animated.View layout={LinearTransition}>
              <Pressable
                onPress={() => confirmDelete({ title: 'Eliminar compra', message: `¿Estás seguro que quieres eliminar "${draft.label.trim() || 'esta compra'}"?`, onConfirm: () => (deleteCardPurchase({ purchase }), onCancel()) })}
                style={{ backgroundColor: theme.bg.danger, borderRadius: 100, height: windowWidth * 0.08, width: windowWidth * 0.1, justifyContent: 'center', alignItems: 'center' }}
              >
                <Icon name='delete' size={windowWidth * 0.045} color={theme.text.onFill} />
              </Pressable>
            </Animated.View>
          )}

          <View style={{ flex: 1 }} />

          <Animated.View layout={LinearTransition}>
            <Pressable onPress={onCancel} style={{ backgroundColor: theme.bg.tr_2, borderRadius: 100, height: windowWidth * 0.08, justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ color: theme.text._1, fontSize: fS.modalTransfer, paddingHorizontal: 20 }}>Cerrar</Text>
            </Pressable>
          </Animated.View>

          {isComplete && hasChanges && (
            <Animated.View layout={LinearTransition} entering={SlideInRight} exiting={SlideOutRight}>
              <Pressable onPress={() => (saveCardPurchase({ purchase: { ...draft, id: purchase.id, cardId: card.id } }), onCancel())} style={{ backgroundColor: theme.bg.check, borderRadius: 100, height: windowWidth * 0.08, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ color: theme.text.onFill, fontSize: fS.modalTransfer, paddingHorizontal: 20 }}>Guardar</Text>
              </Pressable>
            </Animated.View>
          )}
        </Animated.View>
      </Animated.View>

      {/* el key rearma el teclado al pasar de la cuota a las cuotas: arranca con el valor de esa fila */}
      {numberField && (
        <CustomKeyboard
          key={numberField}
          initialValue={String(draft[numberField] || 0)}
          onChange={(nextValue) => setDraft((prev) => ({ ...prev, [numberField]: Number(nextValue) }))}
          onConfirm={(nextValue) => {
            // cero cuotas no existe: se queda en una, que es al contado
            setDraft((prev) => ({ ...prev, [numberField]: numberField === 'installments' ? Math.max(1, Number(nextValue)) : Number(nextValue) }));
            setNumberField(null);
          }}
        />
      )}

      {picking === 'date' && (
        <DatePicker
          value={draft.date}
          onChange={(date) => setDraft((prev) => ({ ...prev, date }))}
          onConfirm={(date) => {
            setDraft((prev) => ({ ...prev, date }));
            setPicking(null);
          }}
        />
      )}
    </Animated.View>
  );
}
