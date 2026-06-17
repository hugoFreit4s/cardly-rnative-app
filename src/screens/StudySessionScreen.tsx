import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import { answerCard, fetchDueDeckCards, fetchRevisionDeckCards, skipCard } from '../api/decksApi';
import type { Card } from '../api/types';
import { useAuth } from '../auth/AuthContext';
import { FlipCard } from '../components/study/FlipCard';
import { showError, showSuccess, showWarning } from '../components/ui/toast';
import type { AppStackParamList } from '../navigation/AppStack';

type Props = NativeStackScreenProps<AppStackParamList, 'StudySession'>;

export function StudySessionScreen({ route, navigation }: Props) {
  const { token, signOut } = useAuth();
  const { deckId, deckName, mode = 'study' } = route.params;

  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [flipped, setFlipped] = useState(false);
  const [hasSeenBack, setHasSeenBack] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const [initialCount, setInitialCount] = useState(0);
  const pendingAdvanceRef = useRef(false);

  const currentCard = useMemo(() => cards[0] ?? null, [cards]);

  const advanceToNextCard = useCallback(() => {
    setCards((prev) => prev.slice(1));
    setFlipped(false);
    setHasSeenBack(false);
    setTransitioning(false);
    pendingAdvanceRef.current = false;
  }, []);

  const handleFlipToFrontComplete = useCallback(() => {
    if (pendingAdvanceRef.current) {
      advanceToNextCard();
    }
  }, [advanceToNextCard]);

  const loadCards = useCallback(async () => {
    setLoading(true);
    try {
      const data =
        mode === 'revision' ? await fetchRevisionDeckCards(deckId, token) : await fetchDueDeckCards(deckId, token);
      setCards(data);
      setInitialCount(data.length);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Erro ao carregar sessão de revisão.';
      if (msg.includes('401')) {
        signOut();
      }
      showError('Falha ao iniciar revisão', msg);
    } finally {
      setLoading(false);
    }
  }, [deckId, mode, token, signOut]);

  useEffect(() => {
    loadCards();
  }, [loadCards]);

  async function onAnswer(correct: boolean) {
    if (!currentCard || busy || transitioning) {
      return;
    }
    if (!hasSeenBack) {
      showWarning('Vire o cartão antes de responder');
      return;
    }
    setBusy(true);
    try {
      await answerCard(deckId, currentCard.id, { correct }, token);
      if (flipped) {
        pendingAdvanceRef.current = true;
        setTransitioning(true);
        setFlipped(false);
      } else {
        advanceToNextCard();
      }
      if (correct) {
        showSuccess('Resposta registrada');
      } else {
        showSuccess('Resposta registrada como erro');
      }
    } catch (e) {
      showError('Não foi possível registrar resposta', e instanceof Error ? e.message : undefined);
    } finally {
      setBusy(false);
    }
  }

  async function onSkip() {
    if (!currentCard || busy || transitioning) {
      return;
    }
    setBusy(true);
    try {
      await skipCard(deckId, currentCard.id, token);
      if (flipped) {
        pendingAdvanceRef.current = true;
        setTransitioning(true);
        setFlipped(false);
      } else {
        advanceToNextCard();
      }
      showSuccess('Cartão pulado');
    } catch (e) {
      showError('Não foi possível pular cartão', e instanceof Error ? e.message : undefined);
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

  if (!currentCard) {
    const sessionCompleted = initialCount > 0;
    return (
      <View className="flex-1 items-center justify-center bg-background-light px-6 dark:bg-background-dark">
        <Text className="text-center font-bold text-2xl text-text-light dark:text-text-dark">
          {sessionCompleted ? 'Sessão concluída' : 'Esta disciplina ainda não tem cartões'}
        </Text>
        <Text className="mt-2 text-center font-regular text-base text-text-secondaryLight dark:text-text-secondaryDark">
          {sessionCompleted
            ? 'Suas respostas foram registradas. As revisões agendadas aparecem na aba Revisões.'
            : 'Adicione cartões à disciplina antes de iniciar o estudo.'}
        </Text>
        <View className="mt-6 w-full max-w-sm gap-3">
          {sessionCompleted ? (
            <Pressable
              className="rounded-xl bg-primary py-4"
              onPress={() => navigation.navigate('Revisions', { deckId })}
            >
              <Text className="text-center font-bold text-base text-white">Ver revisões</Text>
            </Pressable>
          ) : (
            <Pressable
              className="rounded-xl bg-primary py-4"
              onPress={() => navigation.navigate('DeckDetail', { deckId, deckName })}
            >
              <Text className="text-center font-bold text-base text-white">Adicionar cartões</Text>
            </Pressable>
          )}
          <Pressable
            className="rounded-xl border border-slate-300 py-4 dark:border-slate-600"
            onPress={() => navigation.goBack()}
          >
            <Text className="text-center font-medium text-base text-text-light dark:text-text-dark">Voltar</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background-light px-5 py-5 dark:bg-background-dark">
      <Text className="mb-4 font-medium text-sm text-text-secondaryLight dark:text-text-secondaryDark">
        Restantes nesta sessão: {cards.length}
      </Text>

      <View className="mb-4 px-1">
        <FlipCard
          question={currentCard.question}
          answer={currentCard.answer}
          flipped={flipped}
          onToggle={() => {
            if (transitioning) {
              return;
            }
            setFlipped((prev) => {
              const next = !prev;
              if (next) {
                setHasSeenBack(true);
              }
              return next;
            });
          }}
          onFlipToFrontComplete={handleFlipToFrontComplete}
          difficultyLevel={currentCard.difficultyLevel}
          rightStreak={currentCard.rightStreak}
          wrongStreak={currentCard.wrongStreak}
        />
      </View>

      <Text
        className="mb-2 text-center font-regular text-sm text-text-secondaryLight dark:text-text-secondaryDark"
        style={{ opacity: hasSeenBack ? 0 : 1 }}
      >
        Vire o cartão para responder
      </Text>

      <View className="mt-4 gap-3">
        <Pressable
          className="rounded-xl bg-success py-4 disabled:opacity-50"
          onPress={() => onAnswer(true)}
          disabled={busy || transitioning}
        >
          <Text className="text-center font-bold text-base text-white">Acertei</Text>
        </Pressable>
        <Pressable
          className="rounded-xl bg-error py-4 disabled:opacity-50"
          onPress={() => onAnswer(false)}
          disabled={busy || transitioning}
        >
          <Text className="text-center font-bold text-base text-white">Errei</Text>
        </Pressable>
        <Pressable
          className="rounded-xl border border-slate-300 py-4 disabled:opacity-50 dark:border-slate-600"
          onPress={onSkip}
          disabled={busy || transitioning}
        >
          <Text className="text-center font-medium text-base text-text-light dark:text-text-dark">Pular</Text>
        </Pressable>
      </View>
    </View>
  );
}
