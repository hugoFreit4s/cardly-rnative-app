import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { colorScheme as nativewindColorScheme, useColorScheme } from 'nativewind';

import { getColors, type ThemeColors } from './colors';

type ThemeScheme = 'light' | 'dark';

type ThemeContextValue = {
  scheme: ThemeScheme;
  colors: ThemeColors;
  toggle: () => void;
  setScheme: (scheme: ThemeScheme) => void;
};

const THEME_STORAGE_KEY = 'cardly.theme.scheme';

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { colorScheme } = useColorScheme();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (stored === 'light' || stored === 'dark') {
          nativewindColorScheme.set(stored);
        }
      } catch {}
      setHydrated(true);
    })();
  }, []);

  const scheme: ThemeScheme = colorScheme === 'dark' ? 'dark' : 'light';

  const setScheme = useCallback((next: ThemeScheme) => {
    nativewindColorScheme.set(next);
    AsyncStorage.setItem(THEME_STORAGE_KEY, next).catch(() => {});
  }, []);

  const toggle = useCallback(() => {
    setScheme(scheme === 'dark' ? 'light' : 'dark');
  }, [scheme, setScheme]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      scheme,
      colors: getColors(scheme),
      toggle,
      setScheme,
    }),
    [scheme, toggle, setScheme]
  );

  if (!hydrated) {
    return null;
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme só pode ser usado dentro de ThemeProvider');
  }
  return ctx;
}

export function useThemeColors(): ThemeColors {
  return useTheme().colors;
}
