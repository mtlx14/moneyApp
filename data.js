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
// semilla más vecinos suyos, todos del mismo peso para que la lista se lea
// pareja sobre el papel. Van de a seis por fila, así que conviene que sean
// múltiplo de seis: son veinticuatro, cuatro filas justas.
export const CATEGORY_COLORS = [
  // azules y fríos
  '#4A7FC1',
  '#3E6EA8',
  '#5A6E8A',
  '#5B7D8C',
  '#6E9AA8',
  '#5FA3B5',
  // verdes
  '#4E9E8F',
  '#5E9A70',
  '#7FA05A',
  '#96A84E',
  '#6E7A72',
  '#8A8378',
  // cálidos
  '#C29B4A',
  '#B8873B',
  '#D08C3E',
  '#C97B5A',
  '#D96F4C',
  '#B05248',
  // rojos, rosados y morados
  '#C4485F',
  '#A85A7A',
  '#9B5FA8',
  '#7A6FA8',
  '#6A5FB8',
  '#7E6A58',
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
