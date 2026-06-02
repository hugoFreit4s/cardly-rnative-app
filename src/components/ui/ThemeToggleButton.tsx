import { Feather } from '@expo/vector-icons';
import React from 'react';
import { Pressable } from 'react-native';

import { useTheme, useThemeColors } from '../../theme';

export function ThemeToggleButton() {
  const { scheme, toggle } = useTheme();
  const colors = useThemeColors();
  const isDark = scheme === 'dark';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Alternar tema"
      onPress={toggle}
      hitSlop={8}
      className="h-9 w-9 items-center justify-center rounded-md border border-slate-300 bg-transparent dark:border-slate-600"
    >
      <Feather name={isDark ? 'sun' : 'moon'} size={18} color={colors.textMuted} />
    </Pressable>
  );
}
