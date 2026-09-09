import { useEffect, useState } from 'react';
import { Dimensions, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import Animated, { Easing, FadeInDown, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useTheme } from '../../../theme/useTheme.js';
import { fS } from '../../../theme/theme.js';
import { CATEGORY_COLORS, CATEGORY_ICONS } from '../../../../data.js';
import { confirmDelete } from '../../../helpers.js';
import Icon from './Icon.js';

const KINDS = ['expense', 'income', 'both'];
const KIND_LABEL = { expense: 'Gasto', income: 'Ingreso', both: 'Gasto e ingreso' };

// Alta y edición de una categoría, con la misma caja de filas que los demás
// modales. `category` sin id es una nueva; con id, la que se está editando.
export default function ModalCategory({ category, onCancel, onSave, onDelete, setShowMenu }) {
  // congeladas al montar: en web el teclado nativo achica window.innerHeight y
  // releerlas encogería el modal mientras se escribe
  const [{ width: windowWidth, height: windowHeight }] = useState(() => Dimensions.get('window'));
  const theme = useTheme();

  const [draft, setDraft] = useState(() => ({ id: category.id, label: category.label || '', icon: category.icon || CATEGORY_ICONS[0], color: category.color || CATEGORY_COLORS[0], kind: category.kind || 'expense', order: category.order }));

  // el menú estorba en el modal, se esconde mientras está abierto
  useEffect(() => {
    if (!setShowMenu) return;
    setShowMenu(false);
    return () => setShowMenu(true);
  }, []);

  // qué fila tiene la lista abierta: 'icon' | 'color' | null. La lista sale
  // dentro de la caja, no al costado como en el modal de movimientos: son
  // sesenta íconos, no caben en un panel angosto
  const [picking, setPicking] = useState(null);

  const boxWidth = windowWidth * 0.8;
  const rowHeight = windowWidth * 0.12;
  const padding = 12;
  const gap = 10;
  const perRow = 6;
  const cell = (boxWidth - padding * 2 - gap * (perRow - 1)) / perRow;
  // la caja recorta lo que sobre (overflow hidden), así que el alto de la lista
  // de íconos es lo que se ve y el resto scrollea adentro
  const iconsHeight = cell * 4 + gap * 3 + padding * 2;
  // los colores son veinticuatro: las mismas cuatro filas que los íconos, y si
  // algún día son más, scrollean igual que ellos
  const colorsHeight = iconsHeight;

  // la lista se queda montada mientras se cierra, si no el contenido desaparece
  // de golpe y la caja se achica sobre el vacío
  const [panelField, setPanelField] = useState(null);
  useEffect(() => {
    if (picking) setPanelField(picking);
  }, [picking]);

  // La caja crece con la lista en vez de saltar: es la misma animación de alto
  // que la fila de "mes 2" del modal de gastos. Va sobre el alto y no sobre un
  // layout transition porque los botones de abajo tienen que seguirla frame a
  // frame; con LinearTransition cada uno corría su propia animación.
  const panelHeight = (panelField === 'icon' ? iconsHeight : colorsHeight) + 1;
  const openHeight = useSharedValue(0);
  const openProgress = useSharedValue(0);

  useEffect(() => {
    const timing = { duration: 250, easing: Easing.out(Easing.quad) };
    openHeight.value = withTiming(picking ? panelHeight : 0, timing);
    openProgress.value = withTiming(picking ? 1 : 0, timing);
  }, [picking, panelField]);

  const panelStyle = useAnimatedStyle(() => ({ height: openHeight.value, overflow: 'hidden' }));
  const panelContentStyle = useAnimatedStyle(() => ({ opacity: openProgress.value }));

  const canSave = draft.label.trim().length > 0;

  const askDelete = () => confirmDelete({ title: 'Eliminar categoría', message: `¿Estás seguro que quieres eliminar "${draft.label.trim() || 'esta categoría'}"?`, onConfirm: () => onDelete(draft) });

  const rows = [
    { field: 'label', label: 'Nombre' },
    { field: 'kind', label: 'Tipo', value: KIND_LABEL[draft.kind] },
    // el ícono y el color se muestran solos, sin texto: la pastilla ya dice cuál es
    { field: 'icon', label: 'Ícono' },
    { field: 'color', label: 'Color' },
  ];

  const openPicker = (field) => {
    if (Platform.OS === 'web') document.activeElement?.blur?.();
    setPicking((prev) => (prev === field ? null : field));
  };

  // el alto de la caja cerrada, para clavar el borde de arriba donde quedaría
  // centrada y que la lista crezca solo hacia abajo, como en el modal de
  // movimientos
  const closedHeight = rows.length * rowHeight + (rows.length - 1) + 10 + windowWidth * 0.08;
  const topOffset = Math.max(0, (windowHeight * 0.6 - closedHeight) / 2);

  return (
    <Animated.View entering={FadeInDown} style={{ position: 'absolute', top: 0, left: 0, width: windowWidth, height: windowHeight }}>
      {/* con una lista abierta, un toque fuera de la caja solo la cierra. Va
          detrás del contenido, así lo de adentro sigue funcionando normal */}
      {!!picking && <Pressable onPress={() => setPicking(null)} style={{ position: 'absolute', top: 0, left: 0, width: windowWidth, height: windowHeight }} />}

      <View style={{ width: windowWidth, height: windowHeight * 0.6, justifyContent: 'flex-start', alignItems: 'center', paddingTop: topOffset }} pointerEvents='box-none'>
        <View style={{ width: boxWidth, borderRadius: 20, overflow: 'hidden' }}>
          {rows.map((row, index) => (
            <View key={row.field}>
              {index > 0 && <View style={{ width: '100%', height: 1, backgroundColor: theme.bg.tr_3 }} />}
              <View style={{ height: rowHeight, backgroundColor: theme.bg.tr_05, flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ height: '100%', justifyContent: 'center', paddingLeft: 15, paddingRight: 10, width: '30%' }}>
                  <Text style={{ color: theme.text._2, fontSize: fS.modalTransfer }}>{`${row.label}:`}</Text>
                </View>

                {row.field === 'label' ? (
                  <TextInput
                    value={draft.label}
                    onChangeText={(text) => setDraft((prev) => ({ ...prev, label: text }))}
                    onFocus={() => setPicking(null)}
                    placeholder='Nombre'
                    placeholderTextColor={theme.text._4}
                    keyboardAppearance='dark'
                    style={{ flex: 1, height: '100%', color: theme.text._1, fontSize: fS.modalTransfer, paddingLeft: 10 }}
                  />
                ) : row.field === 'kind' ? (
                  // el tipo se cambia tocándolo, como el del modal de gastos
                  <Pressable onPress={() => setDraft((prev) => ({ ...prev, kind: KINDS[(KINDS.indexOf(prev.kind) + 1) % KINDS.length] }))} style={{ flex: 1, height: '100%', justifyContent: 'center', paddingLeft: 10 }}>
                    <Text style={{ color: theme.text._1, fontSize: fS.modalTransfer }}>{row.value}</Text>
                  </Pressable>
                ) : (
                  <Pressable onPress={() => openPicker(row.field)} style={{ flex: 1, height: '100%', flexDirection: 'row', alignItems: 'center', gap: 8, paddingLeft: 10 }}>
                    {row.field === 'icon' ? (
                      // la pastilla de la categoría, igual que en la lista
                      <View style={{ width: windowWidth * 0.07, height: windowWidth * 0.07, borderRadius: 7, backgroundColor: draft.color, justifyContent: 'center', alignItems: 'center' }}>
                        <Icon name={draft.icon} size={windowWidth * 0.04} color={theme.text.onFill} />
                      </View>
                    ) : (
                      // el color va solo, sin el ícono encima: es lo que se elige acá
                      <View style={{ width: windowWidth * 0.07, height: windowWidth * 0.07, borderRadius: 100, backgroundColor: draft.color }} />
                    )}
                    {!!row.value && (
                      <Text numberOfLines={1} style={{ color: theme.text._1, fontSize: fS.modalTransfer, flex: 1 }}>
                        {row.value}
                      </Text>
                    )}
                  </Pressable>
                )}
              </View>
            </View>
          ))}

          {/* la lista, dentro de la caja: la recorta el overflow y su alto no
              depende del contenido, así el modal no se desborda */}
          {!!panelField && (
            <Animated.View style={panelStyle}>
              <View style={{ width: '100%', height: 1, backgroundColor: theme.bg.tr_3 }} />
              {panelField === 'icon' ? (
                // alto fijo: los sesenta íconos scrollean adentro
                <Animated.ScrollView style={[{ height: iconsHeight, backgroundColor: theme.bg.tr_05 }, panelContentStyle]} contentContainerStyle={{ flexDirection: 'row', flexWrap: 'wrap', gap, padding }}>
                  {CATEGORY_ICONS.map((name) => {
                    const active = draft.icon === name;
                    return (
                      <Pressable
                        key={name}
                        onPress={() => setDraft((prev) => ({ ...prev, icon: name }))}
                        style={{ width: cell, height: cell, borderRadius: 9, justifyContent: 'center', alignItems: 'center', backgroundColor: active ? draft.color : theme.bg.tr_1 }}
                      >
                        <Icon name={name} size={cell * 0.5} color={active ? theme.text.onFill : theme.text._2} />
                      </Pressable>
                    );
                  })}
                </Animated.ScrollView>
              ) : (
                <Animated.ScrollView style={[{ height: colorsHeight, backgroundColor: theme.bg.tr_05 }, panelContentStyle]} contentContainerStyle={{ flexDirection: 'row', flexWrap: 'wrap', gap, padding }}>
                  {CATEGORY_COLORS.map((color) => (
                    // el elegido se marca con un anillo alrededor, no con un
                    // borde encima: sobre doce colores distintos no se leería
                    <Pressable
                      key={color}
                      onPress={() => setDraft((prev) => ({ ...prev, color }))}
                      style={{ width: cell, height: cell, borderRadius: 100, justifyContent: 'center', alignItems: 'center', borderWidth: draft.color === color ? 2 : 0, borderColor: theme.text._4 }}
                    >
                      <View style={{ width: cell - 8, height: cell - 8, borderRadius: 100, backgroundColor: color }} />
                    </Pressable>
                  ))}
                </Animated.ScrollView>
              )}
            </Animated.View>
          )}
        </View>

        {/* botones, en la misma fila de pastillas que el modal de movimientos */}
        <View style={{ width: boxWidth, marginTop: 10, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          {!!draft.id && (
            <Pressable onPress={askDelete} style={{ height: windowWidth * 0.08, paddingHorizontal: 15, borderRadius: 100, justifyContent: 'center', backgroundColor: theme.bg.tr_2 }}>
              <Text style={{ color: theme.text._1, fontSize: fS.modalTransfer }}>Eliminar</Text>
            </Pressable>
          )}
          <View style={{ flex: 1 }} />
          <Pressable onPress={onCancel} style={{ height: windowWidth * 0.08, paddingHorizontal: 15, borderRadius: 100, justifyContent: 'center', backgroundColor: theme.bg.tr_2 }}>
            <Text style={{ color: theme.text._1, fontSize: fS.modalTransfer }}>Cerrar</Text>
          </Pressable>
          <Pressable disabled={!canSave} onPress={() => onSave(draft)} style={{ height: windowWidth * 0.08, paddingHorizontal: 20, borderRadius: 100, justifyContent: 'center', backgroundColor: theme.bg.check, opacity: canSave ? 1 : 0.4 }}>
            <Text style={{ color: theme.text.onFill, fontSize: fS.modalTransfer }}>Guardar</Text>
          </Pressable>
        </View>
      </View>
    </Animated.View>
  );
}
