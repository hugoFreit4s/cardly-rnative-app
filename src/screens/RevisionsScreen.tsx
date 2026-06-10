import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';

import { fetchRevisions } from '../api/revisionsApi';
import type { RevisionDeckSummary } from '../api/types';
import { useAuth } from '../auth/AuthContext';
import { showError } from '../components/ui/toast';
import type { AppStackParamList } from '../navigation/AppStack';
import { difficultyLabel } from '../utils/difficulty';
import { formatCountdown, isDue } from '../utils/formatCountdown';

type Props = NativeStackScreenProps<AppStackParamList, 'Revisions'>;

export function RevisionsScreen({ route, navigation }: Props) {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [decks, setDecks] = useState<RevisionDeckSummary[]>([]);
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});
  const [now, setNow] = useState(Date.now());
  const highlightDeckId = route.params?.deckId;
  const scrollRef = useRef<ScrollView>(null);
  const deckOffsets = useRef<Record<number, number>>({});

  const load = useCallback(
    async (silent = false) => {
      if (!silent) {
        setLoading(true);
      }
      try {
        const data = await fetchRevisions(token);
        setDecks(data.decks);
        setExpanded((prev) => {
          const next: Record<number, boolean> = {};
          data.decks.forEach((deck) => {
            if (prev[deck.id] !== undefined) {
              next[deck.id] = prev[deck.id];
            } else {
              next[deck.id] = highlightDeckId ? deck.id === highlightDeckId : false;
            }
          });
          return next;
        });
      } catch (e) {
        showError('Erro ao carregar revisões', e instanceof Error ? e.message : undefined);
      } finally {
        setLoading(false);
      }
    },
    [token, highlightDeckId]
  );

  useEffect(() => {
    load();
  }, [load]);

  useFocusEffect(
    useCallback(() => {
      load(true);
      if (highlightDeckId) {
        setExpanded({ [highlightDeckId]: true });
      } else {
        setExpanded({});
      }
    }, [highlightDeckId, load])
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const justReleased = decks.some((deck) =>
      deck.cards.some((card) => {
        if (!card.dueAt) {
          return false;
        }
        const remaining = new Date(card.dueAt).getTime() - now;
        return remaining <= 0 && remaining > -1500;
      })
    );
    if (justReleased) {
      load();
    }
  }, [now, decks, load]);

  useEffect(() => {
    if (!highlightDeckId || loading || decks.length === 0) {
      return;
    }
    const offset = deckOffsets.current[highlightDeckId];
    if (offset !== undefined) {
      scrollRef.current?.scrollTo({ y: offset, animated: true });
    }
  }, [highlightDeckId, loading, decks]);

  function toggleDeck(deckId: number) {
    setExpanded((prev) => ({ ...prev, [deckId]: !prev[deckId] }));
  }

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-background-light dark:bg-background-dark">
        <ActivityIndicator color="#2563EB" size="large" />
      </View>
    );
  }

  if (decks.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-background-light px-6 dark:bg-background-dark">
        <Text className="text-center font-bold text-xl text-text-light dark:text-text-dark">Sem revisões</Text>
        <Text className="mt-2 text-center font-regular text-base text-text-secondaryLight dark:text-text-secondaryDark">
          Estude cartões para que revisões apareçam aqui.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      ref={scrollRef}
      className="flex-1 bg-background-light dark:bg-background-dark"
      contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
    >
      {decks.map((deck) => {
        const isOpen = expanded[deck.id] ?? false;
        return (
          <View
            key={deck.id}
            onLayout={(event) => {
              deckOffsets.current[deck.id] = event.nativeEvent.layout.y;
            }}
            className={`mb-4 rounded border border-slate-200 bg-surface-light dark:border-slate-700 dark:bg-surface-dark ${
              highlightDeckId === deck.id ? 'border-primary' : ''
            }`}
            style={{ borderRadius: 4, overflow: 'hidden' }}
          >
            <Pressable
              className="flex-row items-center justify-between p-4"
              onPress={() => toggleDeck(deck.id)}
              accessibilityRole="button"
              accessibilityState={{ expanded: isOpen }}
            >
              <View className="flex-1 pr-3">
                <Text className="font-bold text-lg text-text-light dark:text-text-dark">{deck.name}</Text>
                <Text className="mt-1 font-regular text-sm text-text-secondaryLight dark:text-text-secondaryDark">
                  {deck.subject}
                </Text>
                <Text className="mt-2 font-medium text-xs text-text-secondaryLight dark:text-text-secondaryDark">
                  {deck.readyRevisionCount} pronta(s) · {deck.waitingCardCount} aguardando
                </Text>
              </View>
              <Feather name={isOpen ? 'chevron-up' : 'chevron-down'} size={22} color="#64748B" />
            </Pressable>

            {isOpen
              ? deck.cards.map((card) => {
                  const diff = difficultyLabel(card.difficultyLevel);
                  const waiting = card.dueAt ? !isDue(card.dueAt, now) : false;
                  return (
                    <View
                      key={card.id}
                      className="mx-4 mb-3 rounded border border-slate-200 bg-background-light p-3 dark:border-slate-600 dark:bg-background-dark"
                      style={{ borderRadius: 4 }}
                    >
                      <Text className="font-medium text-base text-text-light dark:text-text-dark" numberOfLines={2}>
                        {card.question}
                      </Text>
                      <View className="mt-2 flex-row items-center justify-between">
                        <Text
                          className="rounded px-2 py-0.5 font-medium text-xs"
                          style={{ color: diff.color, backgroundColor: diff.backgroundColor }}
                        >
                          {diff.label}
                        </Text>
                        {waiting && card.dueAt ? (
                          <View className="flex-row items-center gap-1">
                            <Feather name="clock" size={14} color="#64748B" />
                            <Text className="font-medium text-xs text-text-secondaryLight dark:text-text-secondaryDark">
                              {formatCountdown(card.dueAt, now)}
                            </Text>
                          </View>
                        ) : (
                          <Pressable
                            className="rounded bg-primary px-3 py-1.5"
                            onPress={() =>
                              navigation.navigate('StudySession', {
                                deckId: deck.id,
                                deckName: deck.name,
                                mode: 'revision',
                              })
                            }
                          >
                            <Text className="font-medium text-xs text-white">Revisar</Text>
                          </Pressable>
                        )}
                      </View>
                    </View>
                  );
                })
              : null}
            {isOpen ? <View className="h-1" /> : null}
          </View>
        );
      })}
    </ScrollView>
  );
}
