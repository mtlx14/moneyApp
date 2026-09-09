import { useEffect, useRef, useState } from 'react';
import { Dimensions, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTheme } from '../../../theme/useTheme.js';
import { useData } from '../../../../context.js';
import { fS } from '../../../theme/theme.js';
import { deleteCategory, saveCategory } from '../../../services.js';
import GoBackScroll from '../components/GoBackScroll.js';
import ModalCategory from '../components/ModalCategory.js';
import Icon from '../components/Icon.js';
import { CONTENT_LEFT } from '../layout.js';

const windowHeight = Dimensions.get('window').height;
const windowWidth = Dimensions.get('window').width;

const KIND_LABEL = { expense: 'Gasto', income: 'Ingreso', both: 'Gasto e ingreso' };

// Listado de categorías, con su modal de edición. Se llega desde el menú de los
// tres puntos de Inicio, así que el gesto de volver la deja ahí.
export default function Categories({ setShowMenu, navigate, nAnimations }) {
  const theme = useTheme();
  const { categories, transactions } = useData();

  // la que está abierta en el modal: con id se edita, sin id es nueva
  const [editing, setEditing] = useState(null);

  // la lista solo anima al volver del modal, no al entrar a la página
  const cameFromModal = useRef(false);
  const openModal = (category) => {
    cameFromModal.current = true;
    setEditing(category);
  };

  // En web el teclado del navegador empuja el documento hacia abajo cuando se
  // escribe el nombre en el modal, y al volver la lista queda cortada a media
  // pantalla: se ve la mitad de abajo y el resto se fue para arriba. El
  // documento vuelve a su lugar cada vez que el modal se abre o se cierra, igual
  // que en Gastos fijos
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const id = setTimeout(() => window.scrollTo(0, 0), 50);
    return () => clearTimeout(id);
  }, [editing]);

  const list = Object.entries(categories)
    .map(([id, category]) => ({ ...category, id }))
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || a.label.localeCompare(b.label));

  // el modal abierto se come el gesto de volver: primero cierra, después sale
  const handleGoBack = () => {
    if (editing) {
      setEditing(null);
      return true;
    }
    return false;
  };

  return (
    <GoBackScroll entering={nAnimations.en} exiting={nAnimations.ex} navigate={navigate} onBack={handleGoBack}>
      <Animated.View style={{ height: windowHeight, width: windowWidth }}>
        {editing ? (
          <ModalCategory
            category={editing}
            setShowMenu={setShowMenu}
            onCancel={() => setEditing(null)}
            onSave={(category) => {
              saveCategory({ category });
              setEditing(null);
            }}
            onDelete={(category) => {
              deleteCategory({ category });
              setEditing(null);
            }}
          />
        ) : (
          // dos FadeInDown anidados igual que el modal: el recorrido se suma y las
          // opacidades se multiplican, con uno solo la entrada no coincide
          <Animated.View entering={cameFromModal.current ? FadeInDown : undefined}>
            <Animated.View entering={cameFromModal.current ? FadeInDown : undefined}>
              <ScrollView style={Platform.OS === 'web' ? { height: windowHeight, width: windowWidth } : undefined}>
                <View style={{ width: windowWidth, height: windowHeight * 0.1, justifyContent: 'flex-end', alignItems: 'center' }}>
                  <Text style={{ color: theme.text._1, fontSize: fS.subsTitle, fontWeight: 400 }}>Categorías</Text>
                </View>

                <View style={{ width: windowWidth, paddingHorizontal: windowWidth * 0.05, paddingLeft: CONTENT_LEFT, gap: 5, marginTop: windowHeight * 0.04 }}>
                  {list.map((category) => {
                    // cuántos movimientos la usan: borrar una que está en uso deja esos
                    // movimientos sin categoría, y conviene saberlo antes
                    const used = transactions.filter((tx) => tx.category === category.id).length;

                    return (
                      <Pressable
                        key={category.id}
                        onPress={() => openModal(category)}
                        style={{ width: '100%', height: windowWidth * 0.14, backgroundColor: theme.bg.account, borderRadius: 10, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, gap: 12 }}
                      >
                        <View style={{ width: windowWidth * 0.09, height: windowWidth * 0.09, borderRadius: 9, backgroundColor: category.color, justifyContent: 'center', alignItems: 'center' }}>
                          <Icon name={category.icon} size={windowWidth * 0.05} color={theme.text.onFill} />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text numberOfLines={1} style={{ color: theme.text._2, fontSize: fS.subsText }}>
                            {category.label}
                          </Text>
                          <Text style={{ color: theme.text._3, fontSize: fS.keyboardBtn * 0.8 }}>
                            {[KIND_LABEL[category.kind] || KIND_LABEL.expense, used > 0 && `${used} ${used === 1 ? 'movimiento' : 'movimientos'}`].filter(Boolean).join(' · ')}
                          </Text>
                        </View>
                        <Icon name='chevron_right' size={windowWidth * 0.05} color={theme.text._4} />
                      </Pressable>
                    );
                  })}

                  {/* agregar: la misma fila, con el más en lugar de la pastilla de color */}
                  <Pressable
                    onPress={() => openModal({ label: '', order: list.length })}
                    style={{ width: '100%', height: windowWidth * 0.14, borderRadius: 10, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, gap: 12, borderWidth: 1, borderColor: theme.bg.divider, marginTop: 10 }}
                  >
                    <View style={{ width: windowWidth * 0.09, height: windowWidth * 0.09, borderRadius: 9, backgroundColor: theme.bg.tr_05, justifyContent: 'center', alignItems: 'center' }}>
                      <Icon name='add' size={windowWidth * 0.05} color={theme.text._2} />
                    </View>
                    <Text style={{ color: theme.text._2, fontSize: fS.subsText }}>Nueva categoría</Text>
                  </Pressable>
                </View>

                <View style={{ width: 100, height: windowHeight * 0.1 }} />
              </ScrollView>
            </Animated.View>
          </Animated.View>
        )}
      </Animated.View>
    </GoBackScroll>
  );
}
