import v2 from './v2/index.js';

// Hay un solo diseño. El hook se queda porque las pantallas lo usan para
// resolver páginas y componentes, pero ya no depende del tema.
export const useDesign = () => v2;
