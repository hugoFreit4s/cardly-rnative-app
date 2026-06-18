import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { useAuth } from '../../auth/AuthContext';
import type { AppStackParamList } from '../../navigation/AppStack';
import { useThemeColors } from '../../theme';
import { HeaderIconButton } from './HeaderIconButton';
import { NotificationBellButton } from './NotificationBellButton';
import { ThemeToggleButton } from './ThemeToggleButton';

type Nav = NativeStackNavigationProp<AppStackParamList, 'Dashboard'>;

export function DashboardHeaderActions() {
  const navigation = useNavigation<Nav>();
  const { signOut } = useAuth();
  const colors = useThemeColors();

  return (
    <View style={styles.row}>
      <NotificationBellButton />
      <HeaderIconButton
        accessibilityRole="button"
        accessibilityLabel="Meu perfil"
        onPress={() => navigation.navigate('Profile')}
        hitSlop={8}
        style={styles.spaced}
      >
        <Feather name="user" size={18} color={colors.textMuted} />
      </HeaderIconButton>
      <ThemeToggleButton style={styles.spaced} />
      <HeaderIconButton
        accessibilityRole="button"
        accessibilityLabel="Sair"
        onPress={signOut}
        hitSlop={8}
        style={styles.spaced}
      >
        <Feather name="log-out" size={18} color={colors.textMuted} />
      </HeaderIconButton>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  spaced: {
    marginLeft: 8,
  },
});
