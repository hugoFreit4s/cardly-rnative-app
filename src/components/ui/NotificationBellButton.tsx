import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { fetchNotificationSummary } from '../../api/notificationsApi';
import { useAuth } from '../../auth/AuthContext';
import type { AppStackParamList } from '../../navigation/AppStack';
import { fontFamily, useThemeColors, type ThemeColors } from '../../theme';
import { playNotificationSound } from '../../utils/notificationSound';
import { HeaderIconButton } from './HeaderIconButton';
import { NotificationBellIcon } from './NotificationBellIcon';

type Nav = NativeStackNavigationProp<AppStackParamList, 'Dashboard'>;

export function NotificationBellButton() {
  const navigation = useNavigation<Nav>();
  const { token } = useAuth();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
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
    <HeaderIconButton
      accessibilityRole="button"
      accessibilityLabel="Notificações"
      onPress={() => navigation.navigate('Notifications')}
      hitSlop={8}
    >
      <NotificationBellIcon size={20} color={colors.textMuted} />
      {unreadCount > 0 ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badgeLabel}</Text>
        </View>
      ) : null}
    </HeaderIconButton>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    badge: {
      position: 'absolute',
      right: -4,
      top: -4,
      minHeight: 16,
      minWidth: 16,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 8,
      backgroundColor: colors.error,
      paddingHorizontal: 4,
    },
    badgeText: {
      fontFamily: fontFamily.bold,
      fontSize: 10,
      color: '#FFFFFF',
    },
  });
}
