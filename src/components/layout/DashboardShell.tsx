import { Feather } from '@expo/vector-icons';
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useThemeColors, type ThemeColors } from '../../theme';
import { DashboardHeaderActions } from '../ui/DashboardHeaderActions';
import { HeaderIconButton } from '../ui/HeaderIconButton';
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
        <HeaderIconButton
          accessibilityRole="button"
          accessibilityLabel={drawerOpen ? 'Fechar menu' : 'Abrir menu'}
          onPress={() => setDrawerOpen((prev) => !prev)}
          hitSlop={8}
          style={styles.menuButton}
        >
          <Feather name={drawerOpen ? 'x' : 'menu'} size={20} color={colors.text} />
        </HeaderIconButton>
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
      paddingTop: topPadding,
      paddingBottom: 12,
      paddingHorizontal: horizontalPadding,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    menuButton: {
      marginRight: 12,
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
