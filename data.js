import { beigeTheme, blueGreenTheme, blueTheme, darkTheme, graphiteBluePurpleTheme, pinkBlueTheme, purple2Theme, purple3Theme, purpleTheme, redTheme } from './src/theme/theme';

export const subAccountCard = {
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
