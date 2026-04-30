import { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'app_storage';

const defaultState = {
  users: {
    matias: { name: 'matias', theme: 'graphite_blue_purple' },
    aylin: { name: 'aylin', theme: 'pink_blue' },
  },
  currentUser: 'aylin',
  monthOffset: 0,
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
          const parsed = JSON.parse(stored);
          setAppStorage({ ...defaultState, ...parsed });
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
    setAppStorage((prev) => ({
      ...prev,
      monthOffset: (prev.monthOffset ?? 0) === 0 ? 1 : 0,
    }));
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
