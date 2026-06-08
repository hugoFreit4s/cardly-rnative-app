import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, Text, TextInput, View } from 'react-native';

import {
  acceptFriendRequest,
  denyFriendRequest,
  listFriends,
  listReceivedRequests,
  listSentRequests,
  sendFriendRequest,
  unsendFriendRequest,
} from '../api/friendsApi';
import type { FriendRequest, FriendSummary } from '../api/types';
import { useAuth } from '../auth/AuthContext';
import { showError, showSuccess } from '../components/ui/toast';
import type { AppStackParamList } from '../navigation/AppStack';

type Nav = NativeStackNavigationProp<AppStackParamList, 'Friends'>;

export function FriendsScreen() {
  const navigation = useNavigation<Nav>();
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [receiverPublicId, setReceiverPublicId] = useState('');
  const [received, setReceived] = useState<FriendRequest[]>([]);
  const [sent, setSent] = useState<FriendRequest[]>([]);
  const [friends, setFriends] = useState<FriendSummary[]>([]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [friendsData, receivedData, sentData] = await Promise.all([
        listFriends(token),
        listReceivedRequests(token),
        listSentRequests(token),
      ]);
      setFriends(friendsData);
      setReceived(receivedData);
      setSent(sentData);
    } catch (e) {
      showError('Erro ao carregar solicitações', e instanceof Error ? e.message : undefined);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  function parsePublicIdInput(value: string): number | null {
    const normalized = value.trim().replace(/^#/, '');
    if (!/^\d{6}$/.test(normalized)) {
      return null;
    }
    const numericId = Number(normalized);
    return Number.isInteger(numericId) && numericId > 0 ? numericId : null;
  }

  async function onSend() {
    const numericId = parsePublicIdInput(receiverPublicId);
    if (numericId === null) {
      showError('Informe um ID público válido (ex.: #124123)');
      return;
    }
    setSending(true);
    try {
      await sendFriendRequest(numericId, token);
      setReceiverPublicId('');
      showSuccess('Solicitação enviada');
      await loadData();
    } catch (e) {
      showError('Não foi possível enviar solicitação', e instanceof Error ? e.message : undefined);
    } finally {
      setSending(false);
    }
  }

  async function onAccept(requestId: number) {
    try {
      await acceptFriendRequest(requestId, token);
      showSuccess('Solicitação aceita');
      await loadData();
    } catch (e) {
      showError('Falha ao aceitar solicitação', e instanceof Error ? e.message : undefined);
    }
  }

  async function onDeny(requestId: number) {
    try {
      await denyFriendRequest(requestId, token);
      showSuccess('Solicitação negada');
      await loadData();
    } catch (e) {
      showError('Falha ao negar solicitação', e instanceof Error ? e.message : undefined);
    }
  }

  async function onUnsend(requestId: number) {
    try {
      await unsendFriendRequest(requestId, token);
      showSuccess('Solicitação cancelada');
      await loadData();
    } catch (e) {
      showError('Falha ao cancelar solicitação', e instanceof Error ? e.message : undefined);
    }
  }

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-background-light dark:bg-background-dark">
        <ActivityIndicator color="#2563EB" size="large" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background-light px-4 py-4 dark:bg-background-dark">
      <Text className="mb-2 font-bold text-lg text-text-light dark:text-text-dark">Adicionar amigo</Text>
      <View className="mb-4 flex-row gap-2">
        <TextInput
          className="flex-1 rounded-xl border border-slate-300 bg-surface-light px-4 py-3 font-regular text-text-light dark:border-slate-600 dark:bg-surface-dark dark:text-text-dark"
          placeholder="ID público (ex.: #124123)"
          placeholderTextColor="#64748B"
          value={receiverPublicId}
          onChangeText={setReceiverPublicId}
          autoCapitalize="none"
          editable={!sending}
        />
        <Pressable className="rounded-xl bg-primary px-4 py-3" onPress={onSend} disabled={sending}>
          <Text className="font-medium text-white">{sending ? '...' : 'Enviar'}</Text>
        </Pressable>
      </View>

      <Text className="mb-2 font-bold text-base text-text-light dark:text-text-dark">Recebidas</Text>
      <FlatList
        data={received}
        keyExtractor={(item) => `received-${item.id}`}
        ListEmptyComponent={<Text className="mb-3 text-text-secondaryLight dark:text-text-secondaryDark">Nenhuma solicitação recebida.</Text>}
        renderItem={({ item }) => (
          <View className="mb-2 rounded-xl bg-surface-light p-3 dark:bg-surface-dark">
            <Text className="font-medium text-text-light dark:text-text-dark">{item.requesterEmail}</Text>
            <View className="mt-2 flex-row gap-2">
              <Pressable className="rounded-lg bg-success px-3 py-1.5" onPress={() => onAccept(item.id)}>
                <Text className="font-medium text-white">Aceitar</Text>
              </Pressable>
              <Pressable className="rounded-lg bg-error px-3 py-1.5" onPress={() => onDeny(item.id)}>
                <Text className="font-medium text-white">Negar</Text>
              </Pressable>
            </View>
          </View>
        )}
      />

      <Text className="mb-2 mt-2 font-bold text-base text-text-light dark:text-text-dark">Amigos</Text>
      <FlatList
        data={friends}
        keyExtractor={(item) => `friend-${item.publicId}`}
        ListEmptyComponent={<Text className="text-text-secondaryLight dark:text-text-secondaryDark">Você ainda não possui amigos adicionados.</Text>}
        renderItem={({ item }) => (
          <Pressable
            className="mb-2 rounded-xl border border-slate-200 bg-surface-light p-3 dark:border-slate-700 dark:bg-surface-dark"
            onPress={() => navigation.navigate('FriendProfile', { friendPublicId: item.publicId, friendName: item.name })}
          >
            <Text className="font-medium text-text-light dark:text-text-dark">{item.name}</Text>
            <Text className="mt-0.5 text-xs text-text-secondaryLight dark:text-text-secondaryDark">
              #{item.publicId} • {item.email}
            </Text>
          </Pressable>
        )}
      />

      <Text className="mb-2 mt-2 font-bold text-base text-text-light dark:text-text-dark">Enviadas</Text>
      <FlatList
        data={sent}
        keyExtractor={(item) => `sent-${item.id}`}
        ListEmptyComponent={<Text className="text-text-secondaryLight dark:text-text-secondaryDark">Nenhuma solicitação enviada.</Text>}
        renderItem={({ item }) => (
          <View className="mb-2 rounded-xl bg-surface-light p-3 dark:bg-surface-dark">
            <Text className="font-medium text-text-light dark:text-text-dark">{item.receiverEmail}</Text>
            <Pressable className="mt-2 self-start rounded-lg border border-error px-3 py-1.5" onPress={() => onUnsend(item.id)}>
              <Text className="font-medium text-error">Cancelar envio</Text>
            </Pressable>
          </View>
        )}
      />
    </View>
  );
}
