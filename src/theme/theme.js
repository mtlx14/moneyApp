import { Platform } from 'react-native';

const isIos = Platform.OS === 'ios';

export const fS = {
  accountCardNumber: isIos ? 44 * 1.2 : 44,
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
export const baseTheme = {
  text: {
    _1: 'rgba(255, 255, 255, 1)',
    _2: 'rgba(255, 255, 255, 0.8)',
    _3: 'rgba(255, 255, 255, 0.6)',
    _4: 'rgba(255, 255, 255, 0.2)',
    green: 'rgb(70, 228, 70)',
    red: 'rgb(245, 89, 89)',
  },
  bg: {
    primary: 'rgb(35, 35, 35)',
    primary_2: 'rgb(20, 20, 20)',
    blue: 'rgba(40, 153, 205, 0.7)',
    red: 'rgba(208, 36, 73, 0.5)',
    green: 'rgba(73, 172, 70, .6)',
    green_03: 'rgba(73, 172, 70, .3)',
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
  },
  fw: {
    home_acc_text: 300,
    home_acc_text_2: 300,
  },
};

const createTheme = (overrides) => {
  return deepMerge(baseTheme, overrides);
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

export const darkTheme = createTheme({
  name: 'dark',
  bg: {
    keyboard: 'rgb(35, 35, 35)',
    keyboard_key: 'rgb(30, 30, 30)',
    menuAccentColor: 'rgba(40, 153, 205, 0.7)',
    green: 'rgb(73, 172, 70)',
    red: 'rgb(208, 70, 70)',
    yellow: 'rgb(247, 185, 70)',
  },
});
export const graphiteBluePurpleTheme = createTheme({
  name: 'graphite_blue_purple',
  bg: {
    primary: 'rgb(54, 66, 85)',
    primary_2: 'rgb(50, 41, 56)',
    green: 'rgba(73, 172, 70, .7)',
    blue: 'rgba(40, 153, 205, 0.6)',
    yellow: 'rgba(247, 185, 70, .7)',
    menuAccentColor: 'rgba(205, 40, 103, .4)',
    red: 'rgba(205, 40, 103, .4)',
    keyboard: 'rgba(255, 255, 255, 0.05)',
  },
});
export const purpleTheme = createTheme({
  name: 'purple',
  text: {
    green: 'rgb(106,240,106)',
  },
  bg: {
    primary: 'rgb(166, 101, 215)',
    primary_2: 'rgb(54, 60, 188)',
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
export const blueGreenTheme = createTheme({
  name: 'blue_green',

  bg: {
    primary: 'rgb(65, 155, 98)',
    primary_2: 'rgb(35, 83, 118)',
  },
  fw: {
    home_acc_text: 500,
    home_acc_text_2: 400,
  },
});
export const pinkBlueTheme = createTheme({
  name: 'pink_blue',

  text: {
    red: 'rgb(255, 104, 104)',
  },
  bg: {
    primary: 'rgb(214, 92, 159)',
    primary_2: 'rgb(75, 114, 134)',
    menuAccentColor: 'rgba(196, 59, 169, 0.5)',
  },
  fw: {
    home_acc_text: 500,
    home_acc_text_2: 400,
  },
});
export const purple2Theme = createTheme({
  name: 'purple_2',
  text: {
    red: 'rgb(255, 104, 104)',
  },
  bg: {
    primary: 'rgb(102, 126, 234)',
    primary_2: 'rgb(118, 75, 162)',
    menuAccentColor: 'rgba(164, 59, 196, 0.5)',
  },
  fw: {
    home_acc_text: 500,
    home_acc_text_2: 400,
  },
});
export const purple3Theme = createTheme({
  name: 'purple_3',
  text: {
    red: 'rgb(255, 104, 104)',
  },
  bg: {
    primary_2: 'rgb(80, 84, 131)',
    primary: 'rgb(153, 148, 205)',
    menuAccentColor: 'rgba(137, 92, 175, 0.5)',
  },
  fw: {
    home_acc_text: 500,
    home_acc_text_2: 400,
  },
});
export const redTheme = createTheme({
  name: 'red',
  text: {
    red: 'rgb(255, 184, 184)',
    green: 'rgb(103, 243, 103)',
  },
  bg: {
    primary_2: 'rgb(240, 45, 93)',
    primary: 'rgb(229, 152, 129)',
    menuAccentColor: 'rgba(71, 161, 240, 0.5)',
  },
  fw: {
    home_acc_text: 500,
    home_acc_text_2: 400,
  },
});
export const blueTheme = createTheme({
  name: 'blue',
  bg: {
    primary_2: 'rgb(9, 32, 62)',
    primary: 'rgb(71, 106, 132)',
    menuAccentColor: 'rgba(37, 56, 108, 0.5)',
  },
  fw: {
    home_acc_text: 500,
    home_acc_text_2: 400,
  },
});
