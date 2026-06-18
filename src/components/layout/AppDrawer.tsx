import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '../../auth/AuthContext';
import type { AppStackParamList } from '../../navigation/AppStack';
import { fontFamily, useThemeColors, type ThemeColors } from '../../theme';

type Nav = NativeStackNavigationProp<AppStackParamList, 'Dashboard'>;

type DrawerScreen = 'Decks' | 'Revisions' | 'Community' | 'Friends' | 'Calendar' | 'Admin';

type DrawerItem = {
  label: string;
  screen: DrawerScreen;
  adminOnly?: boolean;
};

const NAV_ITEMS: DrawerItem[] = [
  { label: 'Minhas Disciplinas', screen: 'Decks' },
  { label: 'Revisões', screen: 'Revisions' },
  { label: 'Comunidade', screen: 'Community' },
  { label: 'Amigos', screen: 'Friends' },
  { label: 'Calendário', screen: 'Calendar' },
  { label: 'Administração', screen: 'Admin', adminOnly: true },
];

type Props = {
  open: boolean;
  onClose: () => void;
};

const DRAWER_WIDTH = 280;

export function AppDrawer({ open, onClose }: Props) {
  const navigation = useNavigation<Nav>();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const styles = React.useMemo(() => createStyles(colors, insets.top), [colors, insets.top]);

  function navigateTo(screen: DrawerScreen) {
    onClose();
    navigation.navigate(screen);
  }

  const visibleItems = NAV_ITEMS.filter((item) => !item.adminOnly || user?.role === 'SUPERADMIN');

  return (
    <Modal visible={open} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.drawerPanel}>
          <View style={styles.drawerHeader}>
            <Text style={styles.drawerTitle}>Cardly</Text>
            <Text style={styles.drawerSubtitle}>Menu de navegação</Text>
          </View>
          <View style={styles.drawerBody}>
            {visibleItems.map((item) => (
              <TouchableOpacity
                key={item.screen}
                accessibilityRole="button"
                activeOpacity={0.75}
                style={styles.navItem}
                onPress={() => navigateTo(item.screen)}
              >
                <Text style={styles.navItemText}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Fechar menu"
          activeOpacity={1}
          style={styles.backdrop}
          onPress={onClose}
        />
      </View>
    </Modal>
  );
}

function createStyles(colors: ThemeColors, topInset: number) {
  return StyleSheet.create({
    overlay: {
      flex: 1,
      flexDirection: 'row',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    drawerPanel: {
      width: DRAWER_WIDTH,
      paddingTop: Math.max(topInset, 12),
      backgroundColor: colors.surface,
      borderRightWidth: 1,
      borderRightColor: colors.border,
      elevation: 8,
    },
    backdrop: {
      flex: 1,
    },
    drawerHeader: {
      marginHorizontal: 16,
      marginBottom: 8,
      paddingBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    drawerTitle: {
      fontFamily: fontFamily.bold,
      fontSize: 20,
      color: colors.text,
    },
    drawerSubtitle: {
      marginTop: 4,
      fontFamily: fontFamily.regular,
      fontSize: 14,
      color: colors.textMuted,
    },
    drawerBody: {
      paddingHorizontal: 12,
      paddingTop: 12,
      paddingBottom: 24,
    },
    navItem: {
      marginBottom: 8,
      minHeight: 48,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
      paddingVertical: 12,
      paddingHorizontal: 14,
      backgroundColor: colors.background,
      justifyContent: 'center',
    },
    navItemText: {
      fontFamily: fontFamily.medium,
      fontSize: 15,
      color: colors.text,
    },
  });
}
