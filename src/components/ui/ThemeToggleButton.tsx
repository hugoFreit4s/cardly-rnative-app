import { Feather } from '@expo/vector-icons';
import React from 'react';
import type { StyleProp, ViewStyle } from 'react-native';

import { useTheme, useThemeColors } from '../../theme';
import { HeaderIconButton } from './HeaderIconButton';

type Props = {
  style?: StyleProp<ViewStyle>;
};

export function ThemeToggleButton({ style }: Props) {
  const { scheme, toggle } = useTheme();
  const colors = useThemeColors();
  const isDark = scheme === 'dark';

  return (
    <HeaderIconButton
      accessibilityRole="button"
      accessibilityLabel="Alternar tema"
      onPress={toggle}
      hitSlop={8}
      style={style}
    >
      <Feather name={isDark ? 'sun' : 'moon'} size={18} color={colors.textMuted} />
    </HeaderIconButton>
  );
}
