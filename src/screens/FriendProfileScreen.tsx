import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Text, View } from 'react-native';

import { fetchFriendProfile } from '../api/friendsApi';
import type { Deck, FriendProfile } from '../api/types';
import { useAuth } from '../auth/AuthContext';
import { showError } from '../components/ui/toast';
import type { AppStackParamList } from '../navigation/AppStack';

type Props = NativeStackScreenProps<AppStackParamList, 'FriendProfile'>;

export function FriendProfileScreen({ route }: Props) {
  const { token } = useAuth();
  const { friendPublicId } = route.params;
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<FriendProfile | null>(null);

  const loadProfile = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchFriendProfile(friendPublicId, token);
      setProfile(data);
    } catch (e) {
      showError('Não foi possível carregar o perfil do amigo', e instanceof Error ? e.message : undefined);
    } finally {
      setLoading(false);
    }
  }, [friendPublicId, token]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-background-light dark:bg-background-dark">
        <ActivityIndicator color="#2563EB" size="large" />
      </View>
    );
  }

  if (!profile) {
    return (
      <View className="flex-1 items-center justify-center bg-background-light px-6 dark:bg-background-dark">
        <Text className="text-center font-medium text-base text-text-secondaryLight dark:text-text-secondaryDark">
          Perfil indisponível no momento.
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background-light px-4 py-4 dark:bg-background-dark">
      <Text className="font-bold text-2xl text-text-light dark:text-text-dark">{profile.name}</Text>
      <Text className="mt-1 font-regular text-sm text-text-secondaryLight dark:text-text-secondaryDark">
        #{profile.publicId} • {profile.email}
      </Text>

      <View className="mt-4 flex-row gap-2">
        <StatCard label="Disciplinas" value={profile.totalSubjects} />
        <StatCard label="Cartões" value={profile.totalCards} />
        <StatCard label="Vencidos" value={profile.dueCards} highlight />
      </View>

      <Text className="mb-2 mt-5 font-bold text-base text-text-light dark:text-text-dark">Disciplinas</Text>
      <FlatList
        data={profile.subjects}
        keyExtractor={(item) => String(item.id)}
        ListEmptyComponent={
          <Text className="text-text-secondaryLight dark:text-text-secondaryDark">
            Esse amigo ainda não possui disciplinas.
          </Text>
        }
        renderItem={({ item }) => <SubjectCard deck={item} />}
      />
    </View>
  );
}

type StatCardProps = {
  label: string;
  value: number;
  highlight?: boolean;
};

function StatCard({ label, value, highlight = false }: StatCardProps) {
  return (
    <View className="flex-1 rounded-xl bg-surface-light p-3 dark:bg-surface-dark">
      <Text className="font-medium text-xs text-text-secondaryLight dark:text-text-secondaryDark">{label}</Text>
      <Text className={`mt-1 font-bold text-xl ${highlight ? 'text-primary' : 'text-text-light dark:text-text-dark'}`}>
        {value}
      </Text>
    </View>
  );
}

type SubjectCardProps = {
  deck: Deck;
};

function SubjectCard({ deck }: SubjectCardProps) {
  return (
    <View className="mb-3 rounded-xl border border-slate-200 bg-surface-light p-4 dark:border-slate-700 dark:bg-surface-dark">
      <Text className="font-bold text-base text-text-light dark:text-text-dark">{deck.subject}</Text>
      <Text className="mt-1 font-medium text-sm text-text-secondaryLight dark:text-text-secondaryDark">{deck.name}</Text>
      <Text className="mt-2 font-regular text-xs text-text-secondaryLight dark:text-text-secondaryDark">
        {deck.cardCount ?? 0} cartões • {deck.readyRevisionCount ?? 0} vencidos
      </Text>
    </View>
  );
}
