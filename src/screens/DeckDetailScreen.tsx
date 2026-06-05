import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { createCard, deleteCard, fetchDeckCards, updateCard } from '../api/decksApi';
import type { Card } from '../api/types';
import { useAuth } from '../auth/AuthContext';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { showError, showSuccess } from '../components/ui/toast';
import type { AppStackParamList } from '../navigation/AppStack';
import { fontFamily, typography, useThemeColors, type ThemeColors } from '../theme';
import { deckStudyActionLabel } from '../utils/deckStudy';

type Props = NativeStackScreenProps<AppStackParamList, 'DeckDetail'>;

export function DeckDetailScreen({ route, navigation }: Props) {
  const { deckId, deckName } = route.params;
  const { token, signOut } = useAuth();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [creating, setCreating] = useState(false);
  const [editingCardId, setEditingCardId] = useState<number | null>(null);
  const [deleteCardId, setDeleteCardId] = useState<number | null>(null);
  const [busyAction, setBusyAction] = useState(false);

  const [expandedId, setExpandedId] = useState<number | null>(null);

  const studyActionLabel = useMemo(() => deckStudyActionLabel(cards), [cards]);

  const load = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true);
      setError(null);
      try {
        const data = await fetchDeckCards(deckId, token);
        setCards(data);
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Erro ao carregar cartões.';
        if (msg.toLowerCase().includes('token') || msg.includes('401')) {
          signOut();
        }
        setError(msg);
        showError('Erro ao carregar cartões', msg);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [deckId, token, signOut]
  );

  useEffect(() => {
    load();
  }, [load]);

  function onRefresh() {
    setRefreshing(true);
    load(true);
  }

  async function onCreate() {
    if (!question.trim() || !answer.trim()) return;
    setCreating(true);
    try {
      const created = await createCard(deckId, { question: question.trim(), answer: answer.trim() }, token);
      setCards((prev) => [...prev, created]);
      setQuestion('');
      setAnswer('');
      setEditingCardId(null);
      setShowForm(false);
      showSuccess('Cartão criado');
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Erro ao criar cartão.';
      setError(msg);
      showError('Erro ao criar cartão', msg);
    } finally {
      setCreating(false);
    }
  }

  function toggleExpand(id: number) {
    setExpandedId((prev) => (prev === id ? null : id));
  }

  async function onUpdateCard(card: Card) {
    if (!question.trim() || !answer.trim()) {
      return;
    }
    setBusyAction(true);
    try {
      const updated = await updateCard(deckId, card.id, { question: question.trim(), answer: answer.trim() }, token);
      setCards((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
      setEditingCardId(null);
      setQuestion('');
      setAnswer('');
      showSuccess('Cartão atualizado');
    } catch (e) {
      showError('Erro ao atualizar cartão', e instanceof Error ? e.message : undefined);
    } finally {
      setBusyAction(false);
    }
  }

  async function onDeleteCard() {
    if (deleteCardId == null) {
      return;
    }
    setBusyAction(true);
    try {
      await deleteCard(deckId, deleteCardId, token);
      setCards((prev) => prev.filter((item) => item.id !== deleteCardId));
      setExpandedId((prev) => (prev === deleteCardId ? null : prev));
      setDeleteCardId(null);
      showSuccess('Cartão removido');
    } catch (e) {
      showError('Erro ao excluir cartão', e instanceof Error ? e.message : undefined);
    } finally {
      setBusyAction(false);
    }
  }

  if (loading && !refreshing) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {error && <Text style={styles.error}>{error}</Text>}

      <Pressable
        style={styles.studyBtn}
        onPress={() => navigation.navigate('StudySession', { deckId, deckName })}
      >
        <Text style={styles.studyBtnText}>{studyActionLabel}</Text>
      </Pressable>

      <FlatList
        data={cards}
        keyExtractor={(c) => String(c.id)}
        contentContainerStyle={cards.length === 0 ? styles.emptyList : styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[typography.body, styles.emptyText]}>Nenhum cartão nesta disciplina.</Text>
            <Text style={[typography.caption, styles.emptyHint]}>
              Toque em "Novo Cartão" para adicionar.
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const expanded = expandedId === item.id;
          return (
            <Pressable
              style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
              onPress={() => toggleExpand(item.id)}
            >
              <Text style={styles.questionLabel}>Pergunta</Text>
              <Text style={styles.questionText}>{item.question}</Text>
              {expanded && (
                <>
                  <View style={styles.answerPanel}>
                    <Text style={styles.answerLabel}>Resposta</Text>
                    <Text style={styles.answerText}>{item.answer}</Text>
                  </View>
                  <View style={styles.cardActions}>
                    <Pressable
                      style={styles.secondaryBtn}
                      onPress={() => {
                        setEditingCardId(item.id);
                        setQuestion(item.question);
                        setAnswer(item.answer);
                        setShowForm(true);
                      }}
                    >
                      <Text style={styles.secondaryBtnText}>Editar</Text>
                    </Pressable>
                    <Pressable style={styles.dangerBtn} onPress={() => setDeleteCardId(item.id)}>
                      <Text style={styles.dangerBtnText}>Excluir</Text>
                    </Pressable>
                  </View>
                </>
              )}
              {!expanded && (
                <Text style={styles.tapHint}>Toque para ver resposta</Text>
              )}
            </Pressable>
          );
        }}
      />

      {showForm ? (
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>{editingCardId ? 'Editar Cartão' : 'Novo Cartão'}</Text>
          <TextInput
            style={styles.input}
            placeholder="Pergunta"
            placeholderTextColor={colors.textMuted}
            value={question}
            onChangeText={setQuestion}
            editable={!creating}
            multiline
          />
          <TextInput
            style={styles.input}
            placeholder="Resposta"
            placeholderTextColor={colors.textMuted}
            value={answer}
            onChangeText={setAnswer}
            editable={!creating}
            multiline
          />
          <View style={styles.formActions}>
            <Pressable
              style={styles.cancelBtn}
              onPress={() => {
                setShowForm(false);
                setEditingCardId(null);
                setQuestion('');
                setAnswer('');
              }}
              disabled={creating || busyAction}
            >
              <Text style={styles.cancelBtnText}>Cancelar</Text>
            </Pressable>
            <Pressable
              style={[styles.createBtn, (!question.trim() || !answer.trim()) && styles.createBtnDisabled]}
              onPress={() => {
                const editingCard = cards.find((c) => c.id === editingCardId);
                if (editingCard) {
                  onUpdateCard(editingCard);
                } else {
                  onCreate();
                }
              }}
              disabled={creating || busyAction || !question.trim() || !answer.trim()}
            >
              {creating || busyAction ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.createBtnText}>{editingCardId ? 'Salvar' : 'Criar'}</Text>
              )}
            </Pressable>
          </View>
        </View>
      ) : (
        <Pressable
          style={styles.fab}
          onPress={() => {
            setEditingCardId(null);
            setShowForm(true);
          }}
        >
          <Text style={styles.fabText}>+ Novo Cartão</Text>
        </Pressable>
      )}

      <ConfirmModal
        visible={deleteCardId !== null}
        title="Excluir cartão"
        message="Deseja excluir este cartão?"
        confirmLabel="Excluir"
        cancelLabel="Cancelar"
        busy={busyAction}
        onCancel={() => setDeleteCardId(null)}
        onConfirm={onDeleteCard}
      />
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
    list: { padding: 16 },
    emptyList: { flex: 1, padding: 16 },
    emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    emptyText: { color: colors.text },
    emptyHint: { color: colors.textMuted, marginTop: 4 },
    error: {
      backgroundColor: '#FEE2E2',
      color: '#B91C1C',
      padding: 12,
      marginHorizontal: 16,
      marginTop: 12,
      borderRadius: 8,
      fontFamily: fontFamily.regular,
      fontSize: 14,
    },
    studyBtn: {
      marginHorizontal: 16,
      marginTop: 12,
      marginBottom: 4,
      backgroundColor: colors.primary,
      borderRadius: 10,
      paddingVertical: 12,
      alignItems: 'center',
    },
    studyBtnText: { color: '#fff', fontFamily: fontFamily.bold, fontSize: 14 },
    card: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 6,
      elevation: 2,
    },
    cardPressed: { opacity: 0.85 },
    questionLabel: { fontFamily: fontFamily.medium, fontSize: 11, color: colors.primary, textTransform: 'uppercase', letterSpacing: 0.5 },
    questionText: { fontFamily: fontFamily.bold, fontSize: 16, color: colors.text, marginTop: 4 },
    answerPanel: {
      marginTop: 12,
      backgroundColor: colors.surfaceAlt,
      borderRadius: 10,
      padding: 12,
      borderLeftWidth: 3,
      borderLeftColor: colors.primary,
    },
    answerLabel: { fontFamily: fontFamily.medium, fontSize: 11, color: colors.primary, textTransform: 'uppercase', letterSpacing: 0.5 },
    answerText: { fontFamily: fontFamily.regular, fontSize: 15, color: colors.text, marginTop: 4 },
    tapHint: { fontFamily: fontFamily.regular, fontSize: 12, color: colors.textMuted, marginTop: 8, fontStyle: 'italic' },
    cardActions: { flexDirection: 'row', marginTop: 10, gap: 8 },
    secondaryBtn: {
      borderWidth: 1,
      borderColor: colors.primary,
      borderRadius: 8,
      paddingVertical: 6,
      paddingHorizontal: 12,
    },
    secondaryBtnText: { color: colors.primary, fontFamily: fontFamily.medium, fontSize: 13 },
    dangerBtn: {
      borderWidth: 1,
      borderColor: colors.error,
      borderRadius: 8,
      paddingVertical: 6,
      paddingHorizontal: 12,
    },
    dangerBtnText: { color: colors.error, fontFamily: fontFamily.medium, fontSize: 13 },
    fab: {
      position: 'absolute',
      bottom: 24,
      right: 24,
      backgroundColor: colors.accent,
      borderRadius: 28,
      paddingVertical: 14,
      paddingHorizontal: 20,
      elevation: 4,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
    },
    fabText: { color: '#fff', fontFamily: fontFamily.bold, fontSize: 15 },
    formCard: {
      position: 'absolute',
      bottom: 24,
      left: 16,
      right: 16,
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 20,
      borderWidth: 1,
      borderColor: colors.border,
      elevation: 6,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
    },
    formTitle: { fontFamily: fontFamily.bold, fontSize: 17, color: colors.text, marginBottom: 12 },
    input: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 10,
      padding: 12,
      fontFamily: fontFamily.regular,
      fontSize: 15,
      color: colors.text,
      marginBottom: 10,
      backgroundColor: colors.background,
      minHeight: 48,
      textAlignVertical: 'top',
    },
    formActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 8 },
    cancelBtn: { paddingVertical: 10, paddingHorizontal: 16, marginRight: 8 },
    cancelBtnText: { fontFamily: fontFamily.medium, fontSize: 15, color: colors.textMuted },
    createBtn: {
      backgroundColor: colors.accent,
      borderRadius: 10,
      paddingVertical: 10,
      paddingHorizontal: 20,
    },
    createBtnDisabled: { opacity: 0.5 },
    createBtnText: { color: '#fff', fontFamily: fontFamily.bold, fontSize: 15 },
  });
}
