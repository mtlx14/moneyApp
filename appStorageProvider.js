import { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { monthKeyOf } from './src/helpers';
import { DEFAULT_THEME } from './data';

const STORAGE_KEY = 'app_storage';

const defaultState = {
  users: {
    matias: { name: 'matias', theme: DEFAULT_THEME },
    aylin: { name: 'aylin', theme: DEFAULT_THEME },
  },
  currentUser: 'aylin',
  monthOffset: 0,
  monthOffsetActivatedAt: null,
  // Marca de la migración al tema nuevo: quien traiga un tema guardado del
  // diseño anterior arranca de nuevo en el por defecto, una sola vez.
  themeMigrated: true,
};

const AppStorageContext = createContext(null);

export const AppStorageProvider = ({ children }) => {
  const [appStorage, setAppStorage] = useState(defaultState);
  const [isReady, setIsReady] = useState(false);

  // 🔹 Cargar storage
  useEffect(() => {
    const loadStorage = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          const storedState = JSON.parse(stored);
          const parsed = { ...defaultState, ...storedState };
          if (parsed.monthOffset === 1 && parsed.monthOffsetActivatedAt && parsed.monthOffsetActivatedAt !== monthKeyOf()) {
            parsed.monthOffset = 0;
            parsed.monthOffsetActivatedAt = null;
          }
          // Se mira el guardado, no `parsed`: el spread de arriba ya le puso
          // la marca del estado por defecto.
          if (!storedState.themeMigrated) {
            parsed.users = Object.fromEntries(Object.entries(parsed.users).map(([name, user]) => [name, { ...user, theme: DEFAULT_THEME }]));
            parsed.themeMigrated = true;
          }
          setAppStorage(parsed);
        }
      } catch (error) {
        console.log('Error loading storage:', error);
      } finally {
        setIsReady(true);
      }
    };

    loadStorage();
  }, []);
  //   useEffect(() => {
  //   const loadStorage = async () => {
  //     try {
  //       // 🧹 BORRAR STORAGE (temporal)
  //       await AsyncStorage.removeItem(STORAGE_KEY);

  //       // 🔁 Guardar estado limpio
  //       await AsyncStorage.setItem(
  //         STORAGE_KEY,
  //         JSON.stringify(defaultState)
  //       );

  //       setAppStorage(defaultState);

  //     } catch (error) {
  //       console.log('Error loading storage:', error);
  //     } finally {
  //       setIsReady(true);
  //     }
  //   };

  //   loadStorage();
  // }, []);

  useEffect(() => {
    if (isReady) {
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(appStorage));
    }
  }, [appStorage, isReady]);

  const setCurrentUser = (name) => {
    setAppStorage((prev) => ({
      ...prev,
      currentUser: name,
    }));
  };

  const updateTheme = (theme) => {
    setAppStorage((prev) => ({
      ...prev,
      users: {
        ...prev.users,
        [prev.currentUser]: {
          ...prev.users[prev.currentUser],
          theme,
        },
      },
    }));
  };

  const currentUser = appStorage.users[appStorage.currentUser];

  const monthOffset = appStorage.monthOffset ?? 0;

  const setMonthOffset = (offset) => {
    setAppStorage((prev) => ({
      ...prev,
      monthOffset: offset,
    }));
  };

  const toggleMonthOffset = () => {
    setAppStorage((prev) => {
      const next = (prev.monthOffset ?? 0) === 0 ? 1 : 0;
      return {
        ...prev,
        monthOffset: next,
        monthOffsetActivatedAt: next === 1 ? monthKeyOf() : null,
      };
    });
  };

  return (
    <AppStorageContext.Provider
      value={{
        users: appStorage.users,
        currentUser,
        updateTheme,
        setCurrentUser,
        isReady,
        monthOffset,
        setMonthOffset,
        toggleMonthOffset,
      }}
    >
      {children}
    </AppStorageContext.Provider>
  );
};

export const useAppStorage = () => useContext(AppStorageContext);
