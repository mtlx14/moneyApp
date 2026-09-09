import { Platform } from 'react-native';

const isIos = Platform.OS === 'ios';

export const fS = {
  accountCardNumber: isIos ? 44 * 1.2 : 44,
  // el monto sobre la tarjeta ancha del historial, que es más baja
  accountCardNumberWide: isIos ? 37 * 1.2 : 37,
  accountCardText: isIos ? 14 * 1.2 : 14,
  animatedSwapTextL: isIos ? 50 * 1.2 : 50,
  animatedSwapTextS_Number: isIos ? 14 * 1.2 : 14,
  animatedSwapTextS_Suf: isIos ? 10 * 1.2 : 10,
  homeSubText: isIos ? 14 * 1.2 : 14,
  keyboardBtn: isIos ? 14 * 1.2 : 14,
  keyboardKey: isIos ? 20 * 1.2 : 20,
  modalTransfer: isIos ? 14 * 1.2 : 14,
  okButton: isIos ? 14 * 1.2 : 16,

  subsTitle: isIos ? 18 * 1.2 : 18,
  subsPayDay: isIos ? 16 * 1.2 : 16,
  subsText: isIos ? 14 * 1.2 : 14,
  mainMenu: isIos ? 14 * 1.2 : 14,
  mSummarySubtitle: isIos ? 14 * 1.2 : 14,
  unmarkBtn: isIos ? 14 * 1.2 : 14,
  userTagName: isIos ? 14 * 1.2 : 14,
};
export const fW = {
  100: isIos ? 200 : 100,
  600: isIos ? 600 : 100,
};

// Hay un solo diseño. El tema solo define colores: la paleta base es la del
// rediseño (papel cálido + tinta gris carbón, nunca negro puro, y un solo
// acento azul), y los temas de abajo son variantes de color sobre ella.
export const baseTheme = {
  text: {
    // _1 y _2 comparten tono a propósito: la jerarquía es de dos niveles,
    // el cuerpo y los totales. El monto grande se distingue por tamaño.
    _1: '#6B6358',
    _2: '#6B6358',
    _3: '#9A9183',
    _4: 'rgba(57, 53, 48, 0.22)',
    green: 'rgb(14, 184, 59)',
    red: 'rgb(208, 66, 66)',
    strong: '#393530',
    // texto sobre un fondo sólido de color
    onFill: 'rgb(255, 255, 255)',
    // texto encima de la imagen de la tarjeta
    onCard: 'rgba(255, 255, 255, 0.92)',
  },
  bg: {
    primary: '#F3EFE6',
    // segundo tono del tema: hoy solo lo usa la muestra del selector de temas
    primary_2: '#EBE4D6',
    // mismo color que primary pero transparente: los degradados necesitan los
    // dos extremos del mismo tono, si no el fade tira a negro
    primary_0: 'rgba(243, 239, 230, 0)',
    // líneas de la cuadrícula del fondo
    grid: 'rgba(57, 53, 48, 0.015)',
    blue: 'rgb(74, 127, 193)',
    red: 'rgba(176, 82, 72, 0.5)',
    green: 'rgba(74, 122, 84, 0.55)',
    green_03: 'rgba(74, 122, 84, 0.25)',
    // verde del botón marcado: el del texto no funciona como fondo
    check: 'rgb(77, 189, 107)',
    // rojo sólido para botones destructivos, con texto encima
    danger: 'rgb(213, 88, 88)',
    // pareja del bg.check: mismo peso, sólido, para que los dos estados del
    // botón se lean como del mismo juego
    yellow: 'rgb(238, 185, 39)',
    keyboard: 'rgba(57, 53, 48, 0.06)',
    keyboard_key: 'rgba(255, 255, 255, 0.5)',
    tr_05: 'rgba(57, 53, 48, 0.04)',
    tr_1: 'rgba(57, 53, 48, 0.08)',
    tr_2: 'rgba(57, 53, 48, 0.14)',
    tr_3: 'rgba(57, 53, 48, 0.2)',
    black_tr_1: 'rgba(57, 53, 48, 0.08)',
    black_tr_2: 'rgba(57, 53, 48, 0.14)',
    menuAccentColor: '#4A7FC1',
    // mismo relleno que las filas de Gastos (tr_05)
    account: 'rgba(57, 53, 48, 0.04)',
    subAccount: 'rgba(57, 53, 48, 0.05)',
    card: '#FAF7F0',
    divider: 'rgba(57, 53, 48, 0.1)',
  },
  fw: {
    home_acc_text: 500,
    home_acc_text_2: 400,
  },
  shadow: {
    card: {
      shadowColor: 'rgb(0, 0, 0)',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 3,
    },
  },
};

const deepMerge = (base, override) => {
  const result = { ...base };

  for (const key in override) {
    if (typeof override[key] === 'object' && override[key] !== null && !Array.isArray(override[key])) {
      result[key] = deepMerge(base[key] || {}, override[key]);
    } else {
      result[key] = override[key];
    }
  }

  return result;
};

const createTheme = (overrides) => {
  return deepMerge(baseTheme, overrides);
};

// Los temas oscuros comparten toda la paleta menos los dos tonos de fondo, así
// que arrancan de acá: texto blanco, transparencias claras y la cuadrícula
// apagada, porque sobre un fondo oscuro las líneas del papel no van.
const darkBase = {
  text: {
    _1: 'rgba(255, 255, 255, 1)',
    _2: 'rgba(255, 255, 255, 0.8)',
    _3: 'rgba(255, 255, 255, 0.6)',
    _4: 'rgba(255, 255, 255, 0.2)',
    green: 'rgb(70, 228, 70)',
    red: 'rgb(245, 89, 89)',
    strong: 'rgba(255, 255, 255, 1)',
  },
  bg: {
    grid: 'transparent',
    blue: 'rgba(40, 153, 205, 0.7)',
    red: 'rgba(208, 36, 73, 0.5)',
    green: 'rgba(73, 172, 70, .6)',
    green_03: 'rgba(73, 172, 70, .3)',
    check: 'rgba(73, 172, 70, .6)',
    danger: 'rgba(208, 36, 73, 0.5)',
    yellow: 'rgba(247, 185, 70, .6)',
    keyboard: 'rgba(255, 255, 255, 0.1)',
    keyboard_key: 'rgba(1,1,1,0.1)',
    tr_05: 'rgba(255, 255, 255, 0.05)',
    tr_1: 'rgba(255, 255, 255, 0.1)',
    tr_2: 'rgba(255, 255, 255, 0.2)',
    tr_3: 'rgba(255, 255, 255, 0.3)',
    black_tr_1: 'rgba(1,1,1,0.1)',
    black_tr_2: 'rgba(1,1,1,0.2)',
    menuAccentColor: 'rgb(40, 112, 205)',
    account: 'rgba(255, 255, 255, 0.05)',
    subAccount: 'rgba(1, 1, 1, 0.05)',
    card: 'rgba(255, 255, 255, 0.05)',
    divider: 'rgba(255, 255, 255, 0.2)',
  },
  fw: {
    home_acc_text: 300,
    home_acc_text_2: 300,
  },
};

const createDarkTheme = (overrides) => createTheme(deepMerge(darkBase, overrides));

// El tema por defecto: la paleta base tal cual.
export const beigeTheme = createTheme({ name: 'beige' });

// ---------------------------------------------------------------------------
// Variantes de color heredadas del diseño anterior
// ---------------------------------------------------------------------------
export const darkTheme = createDarkTheme({
  name: 'dark',
  bg: {
    primary: 'rgb(35, 35, 35)',
    primary_2: 'rgb(20, 20, 20)',
    primary_0: 'rgba(35, 35, 35, 0)',
    keyboard: 'rgb(35, 35, 35)',
    keyboard_key: 'rgb(30, 30, 30)',
    menuAccentColor: 'rgba(40, 153, 205, 0.7)',
    green: 'rgb(73, 172, 70)',
    red: 'rgb(208, 70, 70)',
    yellow: 'rgb(247, 185, 70)',
  },
});
export const graphiteBluePurpleTheme = createDarkTheme({
  name: 'graphite_blue_purple',
  bg: {
    primary: 'rgb(54, 66, 85)',
    primary_2: 'rgb(50, 41, 56)',
    primary_0: 'rgba(54, 66, 85, 0)',
    green: 'rgba(73, 172, 70, .7)',
    blue: 'rgba(40, 153, 205, 0.6)',
    yellow: 'rgba(247, 185, 70, .7)',
    menuAccentColor: 'rgba(205, 40, 103, .4)',
    red: 'rgba(205, 40, 103, .4)',
    keyboard: 'rgba(255, 255, 255, 0.05)',
  },
});
export const purpleTheme = createDarkTheme({
  name: 'purple',
  text: {
    green: 'rgb(106,240,106)',
  },
  bg: {
    primary: 'rgb(166, 101, 215)',
    primary_2: 'rgb(54, 60, 188)',
    primary_0: 'rgba(166, 101, 215, 0)',
    keyboard: 'rgba(255, 255, 255, 0.1)',
    keyboard_key: 'rgba(255, 255, 255, 0.1)',
    menuAccentColor: 'rgba(205, 40, 103, .6)',
    red: 'rgba(205, 40, 103, .6)',
  },
  fw: {
    home_acc_text: 500,
    home_acc_text_2: 400,
  },
});
export const blueGreenTheme = createDarkTheme({
  name: 'blue_green',
  bg: {
    primary: 'rgb(65, 155, 98)',
    primary_2: 'rgb(35, 83, 118)',
    primary_0: 'rgba(65, 155, 98, 0)',
  },
  fw: {
    home_acc_text: 500,
    home_acc_text_2: 400,
  },
});
export const pinkBlueTheme = createDarkTheme({
  name: 'pink_blue',
  text: {
    red: 'rgb(255, 104, 104)',
  },
  bg: {
    primary: 'rgb(214, 92, 159)',
    primary_2: 'rgb(75, 114, 134)',
    primary_0: 'rgba(214, 92, 159, 0)',
    menuAccentColor: 'rgba(196, 59, 169, 0.5)',
  },
  fw: {
    home_acc_text: 500,
    home_acc_text_2: 400,
  },
});
export const purple2Theme = createDarkTheme({
  name: 'purple_2',
  text: {
    red: 'rgb(255, 104, 104)',
  },
  bg: {
    primary: 'rgb(102, 126, 234)',
    primary_2: 'rgb(118, 75, 162)',
    primary_0: 'rgba(102, 126, 234, 0)',
    menuAccentColor: 'rgba(164, 59, 196, 0.5)',
  },
  fw: {
    home_acc_text: 500,
    home_acc_text_2: 400,
  },
});
export const purple3Theme = createDarkTheme({
  name: 'purple_3',
  text: {
    red: 'rgb(255, 104, 104)',
  },
  bg: {
    primary: 'rgb(153, 148, 205)',
    primary_2: 'rgb(80, 84, 131)',
    primary_0: 'rgba(153, 148, 205, 0)',
    menuAccentColor: 'rgba(137, 92, 175, 0.5)',
  },
  fw: {
    home_acc_text: 500,
    home_acc_text_2: 400,
  },
});
export const redTheme = createDarkTheme({
  name: 'red',
  text: {
    red: 'rgb(255, 184, 184)',
    green: 'rgb(103, 243, 103)',
  },
  bg: {
    primary: 'rgb(229, 152, 129)',
    primary_2: 'rgb(240, 45, 93)',
    primary_0: 'rgba(229, 152, 129, 0)',
    menuAccentColor: 'rgba(71, 161, 240, 0.5)',
  },
  fw: {
    home_acc_text: 500,
    home_acc_text_2: 400,
  },
});
export const blueTheme = createDarkTheme({
  name: 'blue',
  bg: {
    primary: 'rgb(71, 106, 132)',
    primary_2: 'rgb(9, 32, 62)',
    primary_0: 'rgba(71, 106, 132, 0)',
    menuAccentColor: 'rgba(37, 56, 108, 0.5)',
  },
  fw: {
    home_acc_text: 500,
    home_acc_text_2: 400,
  },
});
