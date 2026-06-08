import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, Text, View } from 'react-native';

import { cloneCommunitySubject, searchCommunitySubjects } from '../api/communityApi';
import type { Deck } from '../api/types';
import { useAuth } from '../auth/AuthContext';
import { showError, showSuccessAction } from '../components/ui/toast';
import type { AppStackParamList } from '../navigation/AppStack';

type Nav = NativeStackNavigationProp<AppStackParamList, 'Community'>;

export function CommunityScreen() {
  const navigation = useNavigation<Nav>();
  const { token } = useAuth();
  const [subjects, setSubjects] = useState<Deck[]>([]);
  const [loading, setLoading] = useState(true);
  const [cloningId, setCloningId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await searchCommunitySubjects(token);
      setSubjects(data);
    } catch (e) {
      showError('Erro ao carregar comunidade', e instanceof Error ? e.message : undefined);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  function openClonedDeck(item: Deck) {
    if (!item.clonedDeckId) {
      return;
    }
    navigation.navigate('DeckDetail', { deckId: item.clonedDeckId, deckName: item.name });
  }

  async function onClone(deckId: number) {
    setCloningId(deckId);
    try {
      const cloned = await cloneCommunitySubject(deckId, token);
      showSuccessAction('Disciplina clonada para sua coleção', 'Abrir disciplina', () => {
        navigation.navigate('DeckDetail', { deckId: cloned.id, deckName: cloned.name });
      });
      await load();
    } catch (e) {
      showError('Falha ao clonar disciplina', e instanceof Error ? e.message : undefined);
    } finally {
      setCloningId(null);
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
      <FlatList
        data={subjects}
        keyExtractor={(item) => String(item.id)}
        ListEmptyComponent={
          <View className="mt-24 items-center">
            <Text className="font-medium text-base text-text-secondaryLight dark:text-text-secondaryDark">
              Nenhuma disciplina pública disponível no momento.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View className="mb-3 rounded-xl border border-slate-200 bg-surface-light p-4 dark:border-slate-700 dark:bg-surface-dark">
            <Text className="font-bold text-lg text-text-light dark:text-text-dark">{item.subject}</Text>
            <Text className="mt-1 font-regular text-sm text-text-secondaryLight dark:text-text-secondaryDark">{item.name}</Text>
            {item.ownerName ? (
              <Text className="mt-0.5 font-regular text-xs text-text-secondaryLight dark:text-text-secondaryDark">
                por {item.ownerName}
              </Text>
            ) : null}
            {item.alreadyCloned ? (
              <Pressable className="mt-3 rounded-lg border border-primary py-2" onPress={() => openClonedDeck(item)}>
                <Text className="text-center font-medium text-primary">Abrir minha cópia</Text>
              </Pressable>
            ) : (
              <Pressable
                className="mt-3 rounded-lg bg-primary py-2 disabled:opacity-50"
                onPress={() => onClone(item.id)}
                disabled={cloningId === item.id}
              >
                <Text className="text-center font-medium text-white">
                  {cloningId === item.id ? 'Clonando...' : 'Clonar'}
                </Text>
              </Pressable>
            )}
          </View>
        )}
      />
    </View>
  );
}
