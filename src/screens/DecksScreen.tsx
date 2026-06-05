import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
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

import { createDeck, deleteDeck, fetchDecks, updateDeck } from '../api/decksApi';
import type { Deck } from '../api/types';
import { useAuth } from '../auth/AuthContext';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { showError, showSuccess } from '../components/ui/toast';
import type { AppStackParamList } from '../navigation/AppStack';
import { fontFamily, typography, useThemeColors, type ThemeColors } from '../theme';

type Nav = NativeStackNavigationProp<AppStackParamList, 'Decks'>;

type CreateDraft = {
  name: string;
  subject: string;
  isPublic: boolean;
};

const EMPTY_DRAFT: CreateDraft = { name: '', subject: '', isPublic: false };

export function DecksScreen() {
  const { token, signOut } = useAuth();
  const navigation = useNavigation<Nav>();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [decks, setDecks] = useState<Deck[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [createDraft, setCreateDraft] = useState<CreateDraft>(EMPTY_DRAFT);
  const [editName, setEditName] = useState('');
  const [editSubject, setEditSubject] = useState('');
  const [editIsPublic, setEditIsPublic] = useState(false);
  const [creating, setCreating] = useState(false);
  const [editingDeckId, setEditingDeckId] = useState<number | null>(null);
  const [deletingDeckId, setDeletingDeckId] = useState<number | null>(null);
  const [deleteModalDeck, setDeleteModalDeck] = useState<Deck | null>(null);

  const isEditing = editingDeckId !== null;
  const formName = isEditing ? editName : createDraft.name;
  const formSubject = isEditing ? editSubject : createDraft.subject;
  const formIsPublic = isEditing ? editIsPublic : createDraft.isPublic;

  const load = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true);
      setError(null);
      try {
        const data = await fetchDecks(token);
        setDecks(data);
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Erro ao carregar disciplinas.';
        if (msg.toLowerCase().includes('token') || msg.includes('401')) {
          signOut();
        }
        setError(msg);
        showError('Erro ao carregar disciplinas', msg);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [token, signOut]
  );

  useEffect(() => {
    load();
  }, [load]);

  useFocusEffect(
    useCallback(() => {
      load(true);
    }, [load])
  );

  function onRefresh() {
    setRefreshing(true);
    load(true);
  }

  function setFormName(value: string) {
    if (isEditing) {
      setEditName(value);
    } else {
      setCreateDraft((prev) => ({ ...prev, name: value }));
    }
  }

  function setFormSubject(value: string) {
    if (isEditing) {
      setEditSubject(value);
    } else {
      setCreateDraft((prev) => ({ ...prev, subject: value }));
    }
  }

  function setFormIsPublic(value: boolean) {
    if (isEditing) {
      setEditIsPublic(value);
    } else {
      setCreateDraft((prev) => ({ ...prev, isPublic: value }));
    }
  }

  function clearCreateDraft() {
    setCreateDraft(EMPTY_DRAFT);
  }

  function closeForm() {
    setShowForm(false);
    if (isEditing) {
      setEditingDeckId(null);
    }
  }

  async function onSaveDeck() {
    if (!formName.trim() || !formSubject.trim()) return;
    setCreating(true);
    try {
      if (editingDeckId) {
        const updated = await updateDeck(
          editingDeckId,
          { name: formName.trim(), subject: formSubject.trim(), isPublic: formIsPublic },
          token
        );
        setDecks((prev) => prev.map((deck) => (deck.id === updated.id ? updated : deck)));
        showSuccess('Disciplina atualizada com sucesso');
        setEditingDeckId(null);
      } else {
        const created = await createDeck(
          { name: formName.trim(), subject: formSubject.trim(), isPublic: formIsPublic },
          token
        );
        setDecks((prev) => [...prev, created]);
        showSuccess('Disciplina criada com sucesso');
        setCreateDraft(EMPTY_DRAFT);
      }
      setShowForm(false);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Erro ao salvar disciplina.';
      setError(msg);
      showError('Erro ao salvar disciplina', msg);
    } finally {
      setCreating(false);
    }
  }

  function openStudy(deck: Deck) {
    navigation.navigate('StudySession', { deckId: deck.id, deckName: deck.name, mode: 'study' });
  }

  function openRevisions(deck: Deck) {
    navigation.navigate('Revisions', { deckId: deck.id });
  }

  function openCreateForm() {
    setEditingDeckId(null);
    setShowForm(true);
  }

  function openEditForm(deck: Deck) {
    setEditingDeckId(deck.id);
    setEditName(deck.name);
    setEditSubject(deck.subject);
    setEditIsPublic(deck.isPublic);
    setShowForm(true);
  }

  async function onDeleteDeck() {
    if (!deleteModalDeck) {
      return;
    }
    setDeletingDeckId(deleteModalDeck.id);
    try {
      await deleteDeck(deleteModalDeck.id, token);
      setDecks((prev) => prev.filter((deck) => deck.id !== deleteModalDeck.id));
      showSuccess('Disciplina excluída');
    } catch (e) {
      showError('Erro ao excluir disciplina', e instanceof Error ? e.message : undefined);
    } finally {
      setDeletingDeckId(null);
      setDeleteModalDeck(null);
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

      <FlatList
        data={decks}
        keyExtractor={(d) => String(d.id)}
        contentContainerStyle={decks.length === 0 ? styles.emptyList : styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[typography.body, styles.emptyText]}>Nenhuma disciplina ainda.</Text>
            <Text style={[typography.caption, styles.emptyHint]}>
              Toque em "Nova Disciplina" para começar.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardName}>{item.name}</Text>
            <Text style={styles.cardDescription}>{item.subject}</Text>
            {item.cardCount !== undefined && (
              <Text style={styles.cardCount}>
                {item.cardCount} {item.cardCount === 1 ? 'cartão' : 'cartões'}
              </Text>
            )}
            <View style={styles.visibilityBadge}>
              <Text style={styles.cardVisibility}>{item.isPublic ? 'Público' : 'Privado'}</Text>
            </View>
            {(item.scheduledCardCount ?? 0) > 0 ? (
              <Pressable style={styles.revisionLink} onPress={() => openRevisions(item)}>
                <Text style={styles.revisionLinkText}>Ver revisões</Text>
              </Pressable>
            ) : (
              <Text style={styles.revisionEmpty}>Sem revisões disponíveis</Text>
            )}
            <View style={styles.cardActions}>
              <Pressable style={styles.secondaryBtn} onPress={() => openStudy(item)}>
                <Text style={styles.secondaryBtnText}>Estudar</Text>
              </Pressable>
              <Pressable style={styles.secondaryBtn} onPress={() => openEditForm(item)}>
                <Text style={styles.secondaryBtnText}>Editar</Text>
              </Pressable>
              <Pressable style={styles.dangerBtn} onPress={() => setDeleteModalDeck(item)}>
                <Text style={styles.dangerBtnText}>Excluir</Text>
              </Pressable>
            </View>
          </View>
        )}
      />

      {showForm ? (
        <View style={styles.formCard}>
          <View style={styles.formHeader}>
            <Text style={styles.formTitle}>{isEditing ? 'Editar Disciplina' : 'Nova Disciplina'}</Text>
            {!isEditing ? (
              <Pressable onPress={clearCreateDraft} disabled={creating} hitSlop={8}>
                <Text style={styles.clearAllText}>Limpar tudo</Text>
              </Pressable>
            ) : null}
          </View>
          <TextInput
            style={styles.input}
            placeholder="Nome da disciplina"
            placeholderTextColor={colors.textMuted}
            value={formName}
            onChangeText={setFormName}
            editable={!creating}
          />
          <TextInput
            style={styles.input}
            placeholder="Disciplina (ex: Matemática)"
            placeholderTextColor={colors.textMuted}
            value={formSubject}
            onChangeText={setFormSubject}
            editable={!creating}
          />
          <Pressable
            style={styles.visibilityToggle}
            onPress={() => setFormIsPublic(!formIsPublic)}
            disabled={creating}
          >
            <View style={[styles.checkbox, formIsPublic && styles.checkboxChecked]} />
            <Text style={styles.visibilityLabel}>Tornar disciplina pública</Text>
          </Pressable>
          <View style={styles.formActions}>
            <Pressable style={styles.cancelBtn} onPress={closeForm} disabled={creating}>
              <Text style={styles.cancelBtnText}>Cancelar</Text>
            </Pressable>
            <Pressable
              style={[styles.createBtn, (!formName.trim() || !formSubject.trim()) && styles.createBtnDisabled]}
              onPress={onSaveDeck}
              disabled={creating || !formName.trim() || !formSubject.trim()}
            >
              {creating ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.createBtnText}>{isEditing ? 'Salvar' : 'Criar'}</Text>
              )}
            </Pressable>
          </View>
        </View>
      ) : (
        <Pressable style={styles.fab} onPress={openCreateForm}>
          <Text style={styles.fabText}>+ Nova Disciplina</Text>
        </Pressable>
      )}

      <ConfirmModal
        visible={deleteModalDeck !== null}
        title="Excluir disciplina"
        message={
          deleteModalDeck
            ? `Deseja excluir "${deleteModalDeck.subject}" e todos os cartões dele?`
            : ''
        }
        confirmLabel="Excluir"
        cancelLabel="Cancelar"
        busy={deletingDeckId !== null}
        onCancel={() => setDeleteModalDeck(null)}
        onConfirm={onDeleteDeck}
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
    card: {
      backgroundColor: colors.surface,
      borderRadius: 4,
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
    cardName: { fontFamily: fontFamily.bold, fontSize: 17, color: colors.primary },
    cardDescription: { fontFamily: fontFamily.regular, fontSize: 14, color: colors.textMuted, marginTop: 4 },
    cardCount: { fontFamily: fontFamily.regular, fontSize: 12, color: colors.textMuted, marginTop: 8 },
    visibilityBadge: {
      alignSelf: 'flex-start',
      marginTop: 8,
      borderRadius: 4,
      paddingHorizontal: 8,
      paddingVertical: 4,
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
    },
    cardVisibility: { fontFamily: fontFamily.medium, fontSize: 12, color: colors.textMuted },
    revisionLink: { marginTop: 10, alignSelf: 'flex-start' },
    revisionLinkText: { fontFamily: fontFamily.medium, fontSize: 13, color: colors.primary, textDecorationLine: 'underline' },
    revisionEmpty: {
      marginTop: 10,
      alignSelf: 'flex-start',
      fontFamily: fontFamily.regular,
      fontSize: 13,
      color: colors.textMuted,
    },
    cardActions: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 12, gap: 8 },
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
      backgroundColor: colors.primary,
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
    formHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 12,
    },
    formTitle: { fontFamily: fontFamily.bold, fontSize: 17, color: colors.text, flex: 1 },
    clearAllText: {
      fontFamily: fontFamily.regular,
      fontSize: 12,
      color: colors.textMuted,
      textDecorationLine: 'underline',
    },
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
    },
    formActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 8 },
    visibilityToggle: { flexDirection: 'row', alignItems: 'center', marginTop: 2, marginBottom: 6 },
    checkbox: {
      width: 18,
      height: 18,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 4,
      marginRight: 8,
      backgroundColor: colors.surface,
    },
    checkboxChecked: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    visibilityLabel: { fontFamily: fontFamily.regular, color: colors.textMuted, fontSize: 13 },
    cancelBtn: { paddingVertical: 10, paddingHorizontal: 16, marginRight: 8 },
    cancelBtnText: { fontFamily: fontFamily.medium, fontSize: 15, color: colors.textMuted },
    createBtn: {
      backgroundColor: colors.primary,
      borderRadius: 10,
      paddingVertical: 10,
      paddingHorizontal: 20,
    },
    createBtnDisabled: { opacity: 0.5 },
    createBtnText: { color: '#fff', fontFamily: fontFamily.bold, fontSize: 15 },
  });
}
