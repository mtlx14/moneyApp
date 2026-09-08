import { Pressable, Text, View } from 'react-native';
import { useTheme } from '../../../theme/useTheme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NAV_WIDTH } from '../layout.js';

const FONT_SIZE = 11;
const LETTER_SPACING = 2;
// Alto que ocupa cada item en el riel, que rotado es el largo disponible para
// su texto. Va holgado: si sobra no se ve, si falta el texto se desborda.
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

  // La página entra desde el lado hacia el que te moviste en el riel. Si la
  // actual no está en la lista (Suscripciones, por ejemplo), cuenta como
  // anterior a todas y el destino siempre queda "más abajo".
  const currentIndex = buttons.findIndex((btn) => btn.name === page);

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
      {buttons.map((btn, index) => {
        const active = page === btn.name;
        const length = Math.ceil(btn.label.length * CHAR_WIDTH) + LABEL_PADDING;

        return (
          // El hueco reserva el espacio vertical; el botón adentro es una caja
          // horizontal común, del tamaño del texto, que se rota entera sobre
          // ese hueco. Nada se desborda, así que el área tocable coincide con
          // lo que se ve.
          <View key={btn.name} style={{ width: NAV_WIDTH, height: length }}>
            <Pressable
              onPress={() => navigate(btn.name, index > currentIndex ? 1 : 0)}
              style={{
                position: 'absolute',
                width: length,
                height: NAV_WIDTH,
                left: (NAV_WIDTH - length) / 2,
                top: (length - NAV_WIDTH) / 2,
                transform: [{ rotate: '-90deg' }],
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text
                style={{
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
          </View>
        );
      })}
    </View>
  );
}
