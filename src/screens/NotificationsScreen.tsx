import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, Text, View } from 'react-native';

import {
  deleteNotifications,
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationsRead,
} from '../api/notificationsApi';
import type { Notification } from '../api/types';
import { useAuth } from '../auth/AuthContext';
import { showError, showSuccess } from '../components/ui/toast';
import type { AppStackParamList } from '../navigation/AppStack';

type Nav = NativeStackNavigationProp<AppStackParamList, 'Notifications'>;

function formatWhen(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function typeLabel(type: Notification['type']): string {
  switch (type) {
    case 'REVIEW_EXPIRED':
      return 'Revisão';
    case 'FRIEND_REQUEST_RECEIVED':
      return 'Amizade';
    case 'FRIEND_REQUEST_ACCEPTED':
      return 'Amizade';
    default:
      return 'Aviso';
  }
}

export function NotificationsScreen() {
  const navigation = useNavigation<Nav>();
  const { token } = useAuth();
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchNotifications(token);
      setItems(data);
      setSelectedIds((prev) => prev.filter((id) => data.some((item) => item.id === id)));
    } catch (e) {
      showError('Erro ao carregar notificações', e instanceof Error ? e.message : undefined);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  function toggleSelection(id: number) {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  }

  async function openNotification(item: Notification) {
    if (!item.read) {
      setItems((prev) => prev.map((n) => (n.id === item.id ? { ...n, read: true } : n)));
      try {
        await markNotificationsRead([item.id], token);
      } catch (e) {
        showError('Falha ao marcar como lida', e instanceof Error ? e.message : undefined);
        await load();
      }
    }

    if (item.type === 'REVIEW_EXPIRED') {
      navigation.navigate('Revisions');
      return;
    }
    navigation.navigate('Friends');
  }

  async function onReadAll() {
    setBusy(true);
    try {
      await markAllNotificationsRead(token);
      showSuccess('Todas as notificações foram marcadas como lidas');
      await load();
    } catch (e) {
      showError('Falha ao marcar como lidas', e instanceof Error ? e.message : undefined);
    } finally {
      setBusy(false);
    }
  }

  async function onMarkSelectedRead() {
    if (selectedIds.length === 0) {
      return;
    }
    setBusy(true);
    try {
      await markNotificationsRead(selectedIds, token);
      showSuccess('Notificações marcadas como lidas');
      setSelectedIds([]);
      await load();
    } catch (e) {
      showError('Falha ao marcar como lidas', e instanceof Error ? e.message : undefined);
    } finally {
      setBusy(false);
    }
  }

  async function onDeleteSelected() {
    if (selectedIds.length === 0) {
      return;
    }
    setBusy(true);
    try {
      await deleteNotifications(selectedIds, token);
      showSuccess('Notificações excluídas');
      setSelectedIds([]);
      await load();
    } catch (e) {
      showError('Falha ao excluir notificações', e instanceof Error ? e.message : undefined);
    } finally {
      setBusy(false);
    }
  }

  async function onDeleteOne(id: number) {
    setBusy(true);
    try {
      await deleteNotifications([id], token);
      setSelectedIds((prev) => prev.filter((item) => item !== id));
      await load();
    } catch (e) {
      showError('Falha ao excluir notificação', e instanceof Error ? e.message : undefined);
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-background-light dark:bg-background-dark">
        <ActivityIndicator color="#2563EB" size="large" />
      </View>
    );
  }

  const hasSelection = selectedIds.length > 0;

  return (
    <View className="flex-1 bg-background-light dark:bg-background-dark">
      <View className="border-b border-slate-200 px-4 py-3 dark:border-slate-700">
        <View className="flex-row flex-wrap gap-2">
          <Pressable
            className="rounded-lg bg-primary px-3 py-2 disabled:opacity-50"
            onPress={onReadAll}
            disabled={busy || items.every((item) => item.read)}
          >
            <Text className="font-medium text-sm text-white">Marcar todas como lidas</Text>
          </Pressable>
          {hasSelection ? (
            <>
              <Pressable
                className="rounded-lg border border-primary px-3 py-2 disabled:opacity-50"
                onPress={onMarkSelectedRead}
                disabled={busy}
              >
                <Text className="font-medium text-sm text-primary">Marcar selecionadas</Text>
              </Pressable>
              <Pressable
                className="rounded-lg border border-error px-3 py-2 disabled:opacity-50"
                onPress={onDeleteSelected}
                disabled={busy}
              >
                <Text className="font-medium text-sm text-error">Excluir selecionadas</Text>
              </Pressable>
            </>
          ) : null}
        </View>
        {hasSelection ? (
          <Text className="mt-2 text-xs text-text-secondaryLight dark:text-text-secondaryDark">
            {selectedIds.length} selecionada(s)
          </Text>
        ) : null}
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={items.length === 0 ? { flex: 1 } : { padding: 16, gap: 12 }}
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center px-6">
            <Text className="text-center font-medium text-base text-text-secondaryLight dark:text-text-secondaryDark">
              Nenhuma notificação por enquanto.
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const selected = selectedIds.includes(item.id);
          return (
            <Pressable
              className={`rounded-xl border p-4 ${
                selected
                  ? 'border-primary bg-primary/5 dark:bg-primary/10'
                  : 'border-slate-200 bg-surface-light dark:border-slate-700 dark:bg-surface-dark'
              } ${item.read ? 'opacity-80' : ''}`}
              onPress={() => openNotification(item)}
              onLongPress={() => toggleSelection(item.id)}
            >
              <View className="flex-row items-start gap-3">
                <Pressable
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: selected }}
                  className={`mt-0.5 h-5 w-5 items-center justify-center rounded border ${
                    selected ? 'border-primary bg-primary' : 'border-slate-400 bg-transparent'
                  }`}
                  onPress={() => toggleSelection(item.id)}
                >
                  {selected ? <Text className="text-xs font-bold text-white">✓</Text> : null}
                </Pressable>
                <View className="min-w-0 flex-1">
                  <View className="flex-row items-center justify-between gap-2">
                    <Text className="font-bold text-base text-text-light dark:text-text-dark">{item.title}</Text>
                    {!item.read ? <View className="h-2 w-2 rounded-full bg-primary" /> : null}
                  </View>
                  <Text className="mt-0.5 text-xs text-text-secondaryLight dark:text-text-secondaryDark">
                    {typeLabel(item.type)} · {formatWhen(item.createdAt)}
                  </Text>
                  <Text className="mt-2 text-sm text-text-light dark:text-text-dark">{item.message}</Text>
                </View>
                <Pressable
                  className="rounded-md border border-error px-2 py-1"
                  onPress={() => onDeleteOne(item.id)}
                  disabled={busy}
                >
                  <Text className="text-xs font-medium text-error">Excluir</Text>
                </Pressable>
              </View>
            </Pressable>
          );
        }}
      />
    </View>
  );
}
