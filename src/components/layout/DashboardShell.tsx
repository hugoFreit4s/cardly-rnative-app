import { Feather } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useThemeColors, type ThemeColors } from '../../theme';
import { DashboardHeaderActions } from '../ui/DashboardHeaderActions';
import { AppDrawer } from './AppDrawer';

type Props = {
  children: React.ReactNode;
};

export function DashboardShell({ children }: Props) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const styles = React.useMemo(() => createStyles(colors, insets), [colors, insets]);

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={drawerOpen ? 'Fechar menu' : 'Abrir menu'}
          onPress={() => setDrawerOpen((prev) => !prev)}
          hitSlop={8}
          style={styles.iconButton}
        >
          <Feather name={drawerOpen ? 'x' : 'menu'} size={20} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Dashboard</Text>
        <DashboardHeaderActions />
      </View>

      <View style={styles.content}>{children}</View>

      <AppDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </View>
  );
}

function createStyles(colors: ThemeColors, insets: { top: number; left: number; right: number }) {
  const topPadding = Math.max(insets.top, 12);
  const horizontalPadding = Math.max(insets.left, insets.right, 16);

  return StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingTop: topPadding,
      paddingBottom: 12,
      paddingHorizontal: horizontalPadding,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    iconButton: {
      height: 36,
      width: 36,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    headerTitle: {
      flex: 1,
      fontFamily: 'DMSans_700Bold',
      fontSize: 18,
      color: colors.text,
    },
    content: {
      flex: 1,
    },
  });
}
