import { beigeTheme, blueGreenTheme, blueTheme, darkTheme, graphiteBluePurpleTheme, pinkBlueTheme, purple2Theme, purple3Theme, purpleTheme, redTheme } from './src/theme/theme';

// Tarjeta por nombre de cuenta. Las claves son el `name` que tiene la cuenta en
// Firestore: si no coincide, no pasa nada y se usa la tarjeta por defecto.
export const accountCardByName = {
  m_account: {
    Bencina: require('./assets/images/card_blue.png'),
    Efectivo: require('./assets/images/card_green.png'),
    'Cuenta corriente': require('./assets/images/card_purple-green.png'),
  },
};

export const subAccountCard = {
  Bencina: require('./assets/images/card_blue.png'),
  Cabify: require('./assets/images/card_purple-green.png'),
  Didi: require('./assets/images/card_orange.png'),
  Uber: require('./assets/images/card_black.png'),
};

export const legacyThemes = {
  graphite_blue_purple: graphiteBluePurpleTheme,
  purple: purpleTheme,
  dark: darkTheme,
  blue_green: blueGreenTheme,
  pink_blue: pinkBlueTheme,
  purple_2: purple2Theme,
  purple_3: purple3Theme,
  red: redTheme,
  blue: blueTheme,
};

// Temas del rediseño
export const newThemes = {
  beige: beigeTheme,
};

export const themes = {
  ...legacyThemes,
  ...newThemes,
};

// Categorías de transacciones. Viven en código por ahora; las transacciones
// guardan solo la clave, así que mudarlas a Firestore es cambiar de dónde sale
// este objeto y nada más.
export const categories = {
  cat_saldo_inicial: { label: 'Saldo inicial', emoji: '🏁', kind: 'both' },
  cat_sueldo: { label: 'Sueldo', emoji: '💼', kind: 'income' },
  cat_transferencia: { label: 'Transferencia', emoji: '🔁', kind: 'both' },
  cat_ajuste: { label: 'Ajuste', emoji: '🩹', kind: 'both' },
  cat_comida: { label: 'Comida', emoji: '🍽️', kind: 'expense' },
  cat_bencina: { label: 'Bencina', emoji: '⛽', kind: 'expense' },
  cat_super: { label: 'Supermercado', emoji: '🛒', kind: 'expense' },
  cat_salidas: { label: 'Salidas', emoji: '🍻', kind: 'expense' },
  cat_otros: { label: 'Otros', emoji: '📦', kind: 'both' },
};
