import { Pressable, Text, View } from 'react-native';
import { useTheme } from '../../../theme/useTheme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppStorage } from '../../../../appStorageProvider';


const NAV_WIDTH = 34;
const FONT_SIZE = 11;
const LETTER_SPACING = 2;
// ancho aproximado de cada carácter, para reservar el alto del texto rotado
const CHAR_WIDTH = FONT_SIZE * 0.62 + LETTER_SPACING;

// v2: barra vertical fija a la izquierda, con el texto girado de abajo hacia
// arriba. Etiquetas cortas: rotadas, una larga se come la pantalla.
export default function MainMenu({ page, navigate }) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { monthOffset, toggleMonthOffset } = useAppStorage();

  const buttons = [
    { name: 'home', label: 'Inicio' },
    { name: 'monthly_summary', label: 'Resumen' },
    { name: 'subscriptions', label: 'Suscripciones' },
    { name: 'matias_accounts', label: 'Matías' },
    { name: 'aylin_accounts', label: 'Aylin' },
    { name: 'toggle_month', label: monthOffset === 0 ? 'Mes siguiente' : 'Mes actual' },
  ];

  const handlePress = (btn) => {
    if (btn.name === 'toggle_month') toggleMonthOffset();
    else navigate(btn.name, btn.name === 'home' ? 0 : 1);
  };

  return (
    <View
      style={{
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        width: NAV_WIDTH,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: insets.bottom + 16,
        gap: 22,
      }}
    >
      {buttons.map((btn) => {
        const active = btn.name === 'toggle_month' ? monthOffset !== 0 : page === btn.name;
        const length = Math.ceil(btn.label.length * CHAR_WIDTH) + 8;

        return (
          <Pressable key={btn.name} onPress={() => handlePress(btn)} style={{ width: NAV_WIDTH, height: length, alignItems: 'center', justifyContent: 'center' }}>
            <Text
              numberOfLines={1}
              style={{
                width: length,
                textAlign: 'center',
                transform: [{ rotate: '-90deg' }],
                fontSize: FONT_SIZE,
                fontWeight: '500',
                letterSpacing: LETTER_SPACING,
                textTransform: 'uppercase',
                color: active ? theme.bg.menuAccentColor : theme.text._1,
                opacity: active ? 1 : 0.3,
              }}
            >
              {btn.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
