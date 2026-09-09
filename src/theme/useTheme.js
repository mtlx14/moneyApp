import { useAppStorage } from '../../appStorageProvider';
import { DEFAULT_THEME, themes } from '../../data';

export const useTheme = () => {
  const { currentUser } = useAppStorage();

  return themes[currentUser.theme] || themes[DEFAULT_THEME];
};
