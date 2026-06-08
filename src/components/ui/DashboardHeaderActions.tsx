import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import { Pressable, View } from 'react-native';

import { useAuth } from '../../auth/AuthContext';
import type { AppStackParamList } from '../../navigation/AppStack';
import { useThemeColors } from '../../theme';
import { ThemeToggleButton } from './ThemeToggleButton';
import { NotificationBellButton } from './NotificationBellButton';

type Nav = NativeStackNavigationProp<AppStackParamList, 'Dashboard'>;

export function DashboardHeaderActions() {
  const navigation = useNavigation<Nav>();
  const { signOut } = useAuth();
  const colors = useThemeColors();

  return (
    <View className="flex-row items-center gap-2">
      <NotificationBellButton />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Meu perfil"
        onPress={() => navigation.navigate('Profile')}
        hitSlop={8}
        className="h-9 w-9 items-center justify-center rounded-md border border-slate-300 bg-transparent dark:border-slate-600"
      >
        <Feather name="user" size={18} color={colors.textMuted} />
      </Pressable>
      <ThemeToggleButton />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Sair"
        onPress={signOut}
        hitSlop={8}
        className="h-9 w-9 items-center justify-center rounded-md border border-slate-300 bg-transparent dark:border-slate-600"
      >
        <Feather name="log-out" size={18} color={colors.textMuted} />
      </Pressable>
    </View>
  );
}
