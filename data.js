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

// Tipos de movimiento. La transacción guarda solo la clave.
// El ícono y el color son fijos por tipo: no se eligen, solo identifican.
// Ojo con los nombres: las letras tienen que estar en el subset de la fuente
// (ver Icon.js) o el glifo sale en blanco.
export const txTypes = {
  initial: { label: 'Saldo inicial', icon: 'wallet', color: '#8A8378' },
  // el verde y el rojo son los de la pantalla de Gastos (bg.check y bg.danger)
  income: { label: 'Ingreso', icon: 'savings', color: '#4DBD6B' },
  expense: { label: 'Gasto', icon: 'receipt', color: '#D55858' },
  transfer: { label: 'Transferencia', icon: 'swap_horiz', color: '#6E9AA8' },
  // Transferencia al otro usuario. Adentro es igual que la de arriba —sale de
  // una cuenta y entra en otra, no es ingreso ni gasto—, lo único distinto es
  // que la cuenta de destino es del otro. La etiqueta se arma con el nombre de
  // quien recibe (ver txTypeLabel), esta es solo el respaldo
  user_transfer: { label: 'Tr. a otro usuario', icon: 'swap_horiz', color: '#7A6FA8' },
  adjustment: { label: 'Ajuste', icon: 'healing', color: '#9A9183' },
};

// Saldo inicial, transferencia y ajuste NO son categorías: son tipos, y los
// movimientos de esos tipos no llevan categoría ninguna. El ícono y el color se
// los pone su entrada de txTypes.
export const TYPES_WITHOUT_CATEGORY = ['initial', 'transfer', 'user_transfer', 'adjustment'];

// Los dos tipos que mueven plata de una cuenta a otra: un solo documento que
// resta en la de origen y suma en la de destino. Todo lo que mire toAccountId
// tiene que mirar los dos
export const TRANSFER_TYPES = ['transfer', 'user_transfer'];

// Los dos usuarios y el tipo de cuenta que lleva cada uno. Las cuentas guardan
// el tipo, así que de una cuenta se sabe de quién es y al revés
export const USER_ACCOUNT_TYPE = { matias: 'm_account', aylin: 'a_account' };
export const ACCOUNT_TYPE_USER = {
  m_account: { name: 'matias', label: 'Matías' },
  a_account: { name: 'aylin', label: 'Aylin' },
};

// Las transferencias van solo entre estas dos cuentas del mismo dueño, así que
// elegido el origen el destino es la otra y no hay nada que elegir. Van por
// **nombre de Firestore**, como el resto de los mapas de este archivo: si el
// nombre no coincide, esa cuenta simplemente no transfiere.
export const TRANSFER_PAIR = ['Cuenta corriente', 'Efectivo'];

// Las cuentas de las apps de transporte. Antes tenían sub-cuentas (Uber, Didi,
// Cabify); hoy eso son transacciones con categoría. Solo llevan **ingresos** y
// solo de las categorías de abajo, y en el listado de cuentas se abren mostrando
// cuánto puso cada una. Van por id de Firestore.
export const RIDE_ACCOUNTS = ['m_account_to_be_paid', 'm_account_currently'];

// Por **etiqueta** de la categoría, como el resto de los mapas de este archivo:
// si la categoría no existe o se renombra, simplemente no aparece. El orden es
// el que se ve dentro de la cuenta. El emoji es el que tenían las sub-cuentas y
// vive acá, no en el movimiento: así la fila se ve igual aunque el movimiento
// cambie de cuenta.
export const RIDE_CATEGORIES = [
  { label: 'Uber', emoji: '🚗' },
  { label: 'Didi', emoji: '🛻' },
  { label: 'Cabify', emoji: '🚙' },
];

// Al marcar un gasto como pagado se ofrece anotar el movimiento, y nace con la
// categoría que le toca por tipo: los fijos son las cuentas de la casa y los
// planeados se pagan con la tarjeta. Va por **etiqueta**, como el resto de los
// mapas de este archivo: si no existe, el modal abre sin categoría.
export const BILL_CATEGORIES = {
  fixed: 'Cuentas',
  planned: 'Tarjeta de crédito',
};

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
  // las de las apps de transporte, ver RIDE_CATEGORIES
  cat_uber: { label: 'Uber', icon: 'local_taxi', color: '#5B7D8C', kind: 'income' },
  cat_didi: { label: 'Didi', icon: 'local_taxi', color: '#D08C3E', kind: 'income' },
  cat_cabify: { label: 'Cabify', icon: 'local_taxi', color: '#7A6FA8', kind: 'income' },
};

// Paleta del selector de categorías: los colores que ya usaban las categorías
// semilla más algunos vecinos, todos del mismo peso para que la lista se lea
// pareja sobre el papel.
export const CATEGORY_COLORS = [
  '#4A7FC1',
  '#5B7D8C',
  '#6E9AA8',
  '#5E9A70',
  '#7FA05A',
  '#C29B4A',
  '#D08C3E',
  '#C97B5A',
  '#B05248',
  '#A85A7A',
  '#7A6FA8',
  '#8A8378',
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
  'wallet',
  'receipt',
  'request_quote',
  'currency_exchange',
  'swap_horiz',
  'trending_up',
  'work',
  'healing',
  // casa
  'home',
  'apartment',
  'bolt',
  'water_drop',
  'wifi',
  'cleaning_services',
  'chair',
  'handyman',
  'local_florist',
  'pets',
  // comida
  'restaurant',
  'fastfood',
  'local_cafe',
  'local_bar',
  'shopping_cart',
  'cake',
  // moverse
  'directions_car',
  'local_gas_station',
  'ev_station',
  'directions_bus',
  'local_taxi',
  'two_wheeler',
  'flight',
  'train',
  // salud y cuidado
  'medical_services',
  'pill',
  'fitness_center',
  'spa',
  'content_cut',
  // ocio
  'movie',
  'music_note',
  'sports_esports',
  'sports_soccer',
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
  'checkroom',
  'shopping_bag',
  'smartphone',
  'computer',
  'child_care',
  'volunteer_activism',
  'key',
  'inventory_2',
];
