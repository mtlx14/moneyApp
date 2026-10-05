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

// Todos los temas son variantes de color del mismo diseño. El primero, beige,
// es el que se usa por defecto; los demás vienen de la paleta anterior.
export const themes = {
  beige: beigeTheme,
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

export const DEFAULT_THEME = 'beige';

// Categorías de transacciones. Ya viven en Firestore (colección 'categories');
// esto es solo la semilla: si la colección está vacía, el contexto la escribe
// con estas y de ahí en adelante manda la base. Se editan desde la página de
// categorías, no acá.
export const defaultCategories = {
  cat_sueldo: { label: 'Sueldo', icon: 'work', color: '#4A7FC1', kind: 'income' },
  cat_comida: { label: 'Comida', icon: 'restaurant', color: '#C97B5A', kind: 'expense' },
  cat_bencina: { label: 'Bencina', icon: 'local_gas_station', color: '#B05248', kind: 'expense' },
  cat_super: { label: 'Supermercado', icon: 'shopping_cart', color: '#5E9A70', kind: 'expense' },
  cat_salidas: { label: 'Salidas', icon: 'local_bar', color: '#C29B4A', kind: 'expense' },
  cat_otros: { label: 'Otros', icon: 'inventory_2', color: '#8A8378', kind: 'both' },
  // las de las apps de transporte
  cat_uber: { label: 'Uber', icon: 'local_taxi', color: '#5B7D8C', kind: 'income' },
  cat_didi: { label: 'Didi', icon: 'local_taxi', color: '#D08C3E', kind: 'income' },
  cat_cabify: { label: 'Cabify', icon: 'local_taxi', color: '#7A6FA8', kind: 'income' },
};

// Paleta del selector de categorías: los colores que ya usaban las categorías
// semilla, sus vecinos y una tanda de tonos oscuros profundos. Van de a seis
// por fila y cada fila es una familia, siguiendo la rueda de color de una fila
// a la otra; los neutros al final. Son treinta y seis, seis filas justas: si se
// agregan, que sea de a seis y en su familia.
export const CATEGORY_COLORS = [
  // azules
  '#5FA3B5',
  '#6E9AA8',
  '#1E5F74',
  '#5B7D8C',
  '#3E6EA8',
  '#4A7FC1',
  // índigos y morados
  '#1F3A68',
  '#6A5FB8',
  '#7A6FA8',
  '#43307A',
  '#6B2A7A',
  '#9B5FA8',
  // rosados y rojos
  '#8A2455',
  '#A85A7A',
  '#C4485F',
  '#8E2B2B',
  '#B05248',
  '#D96F4C',
  // naranjas y amarillos
  '#C97B5A',
  '#8C4A1E',
  '#D08C3E',
  '#B8873B',
  '#C29B4A',
  '#8A6A12',
  // verdes
  '#96A84E',
  '#4A6B1F',
  '#7FA05A',
  '#5E9A70',
  '#1F6B52',
  '#4E9E8F',
  // neutros
  '#8A8378',
  '#7E6A58',
  '#5C4033',
  '#6E7A72',
  '#5A6E8A',
  '#2E2F3A',
];

// Iconos que ofrece el selector. Es una lista curada, no todo Material Symbols:
// la fuente los tiene todos (ver components/Icon.js), pero elegir entre tres mil
// no sirve de nada. Agregar acá el que falte, escrito igual que en
// https://fonts.google.com/icons
export const CATEGORY_ICONS = [
  // plata
  'savings',
  'payments',
  'credit_card',
  'account_balance',
  'account_balance_wallet',
  'wallet',
  'receipt',
  'receipt_long',
  'request_quote',
  'currency_exchange',
  'attach_money',
  'paid',
  'price_check',
  'sell',
  'toll',
  'swap_horiz',
  'trending_up',
  'work',
  'healing',
  // casa
  'home',
  'cottage',
  'apartment',
  'bolt',
  'lightbulb',
  'water_drop',
  'wifi',
  'ac_unit',
  'cleaning_services',
  'local_laundry_service',
  'kitchen',
  'bed',
  'chair',
  'handyman',
  'plumbing',
  'construction',
  'roofing',
  'yard',
  'local_florist',
  'pets',
  // comida
  'restaurant',
  'fastfood',
  'local_pizza',
  'lunch_dining',
  'bakery_dining',
  'set_meal',
  'egg',
  'icecream',
  'local_cafe',
  'coffee',
  'local_bar',
  'liquor',
  'shopping_cart',
  'cake',
  // moverse
  'directions_car',
  'car_repair',
  'local_gas_station',
  'ev_station',
  'local_parking',
  'directions_bus',
  'subway',
  'commute',
  'local_taxi',
  'two_wheeler',
  'moped',
  'directions_bike',
  'local_shipping',
  'directions_boat',
  'flight',
  'train',
  // salud y cuidado
  'medical_services',
  'emergency',
  'vaccines',
  'pill',
  'monitor_heart',
  'dentistry',
  'psychology',
  'self_improvement',
  'fitness_center',
  'spa',
  'content_cut',
  // ocio
  'movie',
  'theaters',
  'music_note',
  'headphones',
  'sports_esports',
  'videogame_asset',
  'sports_soccer',
  'sports_basketball',
  'sports_tennis',
  'stadium',
  'casino',
  'palette',
  'photo_camera',
  'confirmation_number',
  'subscriptions',
  'live_tv',
  'celebration',
  'redeem',
  'park',
  'beach_access',
  'luggage',
  'hotel',
  // otros
  'school',
  'book',
  'auto_stories',
  'translate',
  'checkroom',
  'shopping_bag',
  'local_mall',
  'store',
  'diamond',
  'watch',
  'smartphone',
  'computer',
  'devices',
  'toys',
  'child_care',
  'group',
  'favorite',
  'volunteer_activism',
  'key',
  'inventory_2',
];
