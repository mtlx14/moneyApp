import { Pressable, Text, View } from 'react-native';
import { useTheme } from '../../../theme/useTheme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';


const NAV_WIDTH = 34;
const FONT_SIZE = 11;
const LETTER_SPACING = 2;
// El Text se dibuja en una caja ancha y fija: como después se rota y se centra,
// el sobrante queda vacío y no se ve, pero garantiza que nunca haya que cortar.
const LABEL_BOX = 240;
// Esta estimación ya no decide si el texto entra, solo cuánto alto ocupa cada
// item en el riel, o sea la separación entre ellos.
const CHAR_WIDTH = FONT_SIZE * 0.9 + LETTER_SPACING;
const LABEL_PADDING = 24;

// v2: barra vertical fija a la izquierda, con el texto girado de abajo hacia
// arriba. Etiquetas cortas: rotadas, una larga se come la pantalla.
export default function MainMenu({ page, navigate }) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const buttons = [
    { name: 'home', label: 'Inicio' },
    { name: 'monthly_summary', label: 'Gastos' },
    { name: 'matias_accounts', label: 'Matías' },
    { name: 'aylin_accounts', label: 'Aylin' },
  ];

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
        const active = page === btn.name;
        const length = Math.ceil(btn.label.length * CHAR_WIDTH) + LABEL_PADDING;

        return (
          <Pressable key={btn.name} onPress={() => navigate(btn.name, btn.name === 'home' ? 0 : 1)} style={{ width: NAV_WIDTH, height: length, alignItems: 'center', justifyContent: 'center' }}>
            <Text
              style={{
                width: LABEL_BOX,
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
