import { useColorScheme } from 'react-native';

import { useAppStorage } from '../../appStorageProvider';
import { themes } from '../../data';

export const useTheme = () => {
  const { currentUser } = useAppStorage();

  return themes[currentUser.theme] || themes.dark;
};
