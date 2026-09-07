import v1 from './v1/index.js';
import v2 from './v2/index.js';
import { useTheme } from '../theme/useTheme.js';

export const designs = { v1, v2 };

// El diseño lo define el tema activo (theme.design). Si el tema no lo declara,
// cae al diseño original.
export const useDesign = () => {
  const theme = useTheme();

  return designs[theme.design] || designs.v1;
};
