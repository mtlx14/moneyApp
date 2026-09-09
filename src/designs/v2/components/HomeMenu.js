import { useState } from 'react';
import { Dimensions, Pressable, Text, View } from 'react-native';
import Animated, { FadeIn, FadeInUp, FadeOut, FadeOutUp } from 'react-native-reanimated';
import { useTheme } from '../../../theme/useTheme.js';
import { useAppStorage } from '../../../../appStorageProvider.js';
import { fS } from '../../../theme/theme.js';
import Icon from './Icon.js';

// Los tres puntos de arriba a la derecha de Inicio, donde antes estaba el mes.
// Adentro va lo que no tiene lugar en el riel: el cambio de mes —que en v2 se
// había quedado sin botón— y la página de categorías.
export default function HomeMenu({ navigate }) {
  const windowWidth = Dimensions.get('window').width;
  const theme = useTheme();
  const { monthOffset, toggleMonthOffset } = useAppStorage();
  const [open, setOpen] = useState(false);

  const size = windowWidth * 0.07;

  const buttons = [
    { name: 'toggle_month', label: monthOffset === 0 ? 'Ir al mes siguiente' : 'Volver al mes actual' },
    { name: 'categories', label: 'Gestionar categorías' },
  ];

  const handlePress = (name) => {
    setOpen(false);
    if (name === 'toggle_month') toggleMonthOffset();
    if (name === 'categories') navigate('categories', 1);
  };

  return (
    <>
      {/* un toque en cualquier otro lado lo cierra, sin tapar el resto mientras
          está cerrado */}
      {open && <Pressable onPress={() => setOpen(false)} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} />}

      <View style={{ position: 'absolute', top: 20, right: 20, alignItems: 'flex-end' }}>
        <Pressable onPress={() => setOpen((prev) => !prev)} style={{ width: size, height: size, borderRadius: 10, backgroundColor: theme.bg.tr_1, justifyContent: 'center', alignItems: 'center' }}>
          <Icon name='more_horiz' size={size * 0.6} color={theme.text._1} />
        </Pressable>

        {open && (
          <Animated.View entering={FadeInUp.duration(150)} exiting={FadeOutUp.duration(150)} style={{ marginTop: 10 }}>
            <View style={{ width: windowWidth * 0.55, borderRadius: 12, overflow: 'hidden', backgroundColor: theme.bg.card, borderWidth: 1, borderColor: theme.bg.divider }}>
              {buttons.map((btn, index) => (
                <View key={btn.name}>
                  {index > 0 && <View style={{ width: '100%', height: 1, backgroundColor: theme.bg.tr_1 }} />}
                  <Pressable onPress={() => handlePress(btn.name)} style={{ height: windowWidth * 0.12, justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={{ color: theme.text._2, fontSize: fS.userTagName }}>{btn.label}</Text>
                  </Pressable>
                </View>
              ))}
            </View>
          </Animated.View>
        )}
      </View>
    </>
  );
}
