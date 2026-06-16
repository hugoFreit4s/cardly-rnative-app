import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useCallback, useRef, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { fetchNotificationSummary } from '../../api/notificationsApi';
import { useAuth } from '../../auth/AuthContext';
import type { AppStackParamList } from '../../navigation/AppStack';
import { useThemeColors } from '../../theme';
import { playNotificationSound } from '../../utils/notificationSound';
import { NotificationBellIcon } from './NotificationBellIcon';

type Nav = NativeStackNavigationProp<AppStackParamList, 'Dashboard'>;

export function NotificationBellButton() {
  const navigation = useNavigation<Nav>();
  const { token } = useAuth();
  const colors = useThemeColors();
  const [unreadCount, setUnreadCount] = useState(0);
  const previousUnreadRef = useRef<number | null>(null);

  const refreshSummary = useCallback(async () => {
    if (!token) {
      setUnreadCount(0);
      previousUnreadRef.current = 0;
      return;
    }
    try {
      const summary = await fetchNotificationSummary(token);
      const nextCount = summary.unreadCount;
      const previous = previousUnreadRef.current;
      if (previous !== null && nextCount > previous) {
        void playNotificationSound();
      }
      previousUnreadRef.current = nextCount;
      setUnreadCount(nextCount);
    } catch {
    }
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      void refreshSummary();
      const interval = setInterval(() => {
        void refreshSummary();
      }, 60000);
      return () => clearInterval(interval);
    }, [refreshSummary]),
  );

  const badgeLabel = unreadCount > 99 ? '99+' : String(unreadCount);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Notificações"
      onPress={() => navigation.navigate('Notifications')}
      hitSlop={8}
      className="relative h-9 w-9 items-center justify-center rounded-md border border-slate-300 bg-transparent dark:border-slate-600"
    >
      <NotificationBellIcon size={20} color={colors.textMuted} />
      {unreadCount > 0 ? (
        <View className="absolute -right-1 -top-1 min-h-[16px] min-w-[16px] items-center justify-center rounded-full bg-error px-1">
          <Text className="text-[10px] font-bold text-white">{badgeLabel}</Text>
        </View>
      ) : null}
    </Pressable>
  );
}
