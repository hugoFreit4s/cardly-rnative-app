import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, Switch, Text, TextInput, View } from 'react-native';

import {
  createCardByAdmin,
  createSubject,
  deleteCardByAdmin,
  deleteSubject,
  deleteUser,
  searchCards,
  searchSubjects,
  searchUsers,
  updateCardByAdmin,
  updateSubject,
} from '../api/adminApi';
import type { Card, Deck, UserSummary } from '../api/types';
import { useAuth } from '../auth/AuthContext';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { showError, showSuccess } from '../components/ui/toast';

type AdminMode = 'users' | 'subjects';
type DisciplinasView = 'users' | 'decks' | 'cards';

function formatPublicId(publicId: number): string {
  return `#${publicId}`;
}

export function AdminScreen() {
  const { token, user } = useAuth();
  const [mode, setMode] = useState<AdminMode>('users');
  const [disciplinasView, setDisciplinasView] = useState<DisciplinasView>('users');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const [users, setUsers] = useState<UserSummary[]>([]);
  const [subjects, setSubjects] = useState<Deck[]>([]);
  const [cards, setCards] = useState<Card[]>([]);

  const [selectedUser, setSelectedUser] = useState<UserSummary | null>(null);
  const [selectedDeck, setSelectedDeck] = useState<Deck | null>(null);

  const [targetUser, setTargetUser] = useState<UserSummary | null>(null);
  const [targetSubject, setTargetSubject] = useState<Deck | null>(null);
  const [targetCard, setTargetCard] = useState<Card | null>(null);

  const [subjectName, setSubjectName] = useState('');
  const [subjectTitle, setSubjectTitle] = useState('');
  const [subjectIsPublic, setSubjectIsPublic] = useState(false);
  const [editingSubjectId, setEditingSubjectId] = useState<number | null>(null);

  const [cardQuestion, setCardQuestion] = useState('');
  const [cardAnswer, setCardAnswer] = useState('');
  const [editingCardId, setEditingCardId] = useState<number | null>(null);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await searchUsers(token);
      setUsers(data);
    } catch (e) {
      showError('Erro ao carregar usuários', e instanceof Error ? e.message : undefined);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const loadSubjectsForUser = useCallback(
    async (owner: UserSummary) => {
      setLoading(true);
      try {
        const data = await searchSubjects(token, { ownerId: owner.id });
        setSubjects(data);
      } catch (e) {
        showError('Erro ao carregar disciplinas', e instanceof Error ? e.message : undefined);
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  const loadCardsForDeck = useCallback(
    async (deck: Deck) => {
      setLoading(true);
      try {
        const data = await searchCards(token, { deckId: deck.id });
        setCards(data);
      } catch (e) {
        showError('Erro ao carregar cartões', e instanceof Error ? e.message : undefined);
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  useEffect(() => {
    if (mode === 'users') {
      loadUsers();
      return;
    }
    setDisciplinasView('users');
    setSelectedUser(null);
    setSelectedDeck(null);
    loadUsers();
  }, [mode, loadUsers]);

  function resetSubjectForm() {
    setSubjectName('');
    setSubjectTitle('');
    setSubjectIsPublic(false);
    setEditingSubjectId(null);
  }

  function resetCardForm() {
    setCardQuestion('');
    setCardAnswer('');
    setEditingCardId(null);
  }

  function onSelectUserForDisciplinas(item: UserSummary) {
    setSelectedUser(item);
    setSelectedDeck(null);
    setDisciplinasView('decks');
    resetSubjectForm();
    resetCardForm();
    loadSubjectsForUser(item);
  }

  function onSelectDeck(item: Deck) {
    setSelectedDeck(item);
    setDisciplinasView('cards');
    resetCardForm();
    loadCardsForDeck(item);
  }

  function onDisciplinasBack() {
    if (disciplinasView === 'cards') {
      setDisciplinasView('decks');
      setSelectedDeck(null);
      resetCardForm();
      if (selectedUser) {
        loadSubjectsForUser(selectedUser);
      }
      return;
    }
    if (disciplinasView === 'decks') {
      setDisciplinasView('users');
      setSelectedUser(null);
      setSelectedDeck(null);
      resetSubjectForm();
      resetCardForm();
      loadUsers();
    }
  }

  async function onDeleteUser() {
    if (!targetUser) {
      return;
    }
    setBusy(true);
    try {
      await deleteUser(targetUser.id, token);
      setUsers((prev) => prev.filter((item) => item.id !== targetUser.id));
      showSuccess('Usuário removido');
    } catch (e) {
      showError('Erro ao remover usuário', e instanceof Error ? e.message : undefined);
    } finally {
      setBusy(false);
      setTargetUser(null);
    }
  }

  async function onSaveSubject() {
    if (!selectedUser || !subjectName.trim() || !subjectTitle.trim()) {
      showError('Preencha nome e disciplina corretamente.');
      return;
    }
    setBusy(true);
    try {
      if (editingSubjectId) {
        const updated = await updateSubject(
          editingSubjectId,
          { name: subjectName.trim(), subject: subjectTitle.trim(), isPublic: subjectIsPublic },
          token
        );
        setSubjects((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
        showSuccess('Disciplina atualizada');
      } else {
        const created = await createSubject(
          {
            ownerId: selectedUser.id,
            name: subjectName.trim(),
            subject: subjectTitle.trim(),
            isPublic: subjectIsPublic,
          },
          token
        );
        setSubjects((prev) => [created, ...prev]);
        showSuccess('Disciplina criada');
      }
      resetSubjectForm();
    } catch (e) {
      showError('Erro ao salvar disciplina', e instanceof Error ? e.message : undefined);
    } finally {
      setBusy(false);
    }
  }

  async function onDeleteSubject() {
    if (!targetSubject) {
      return;
    }
    setBusy(true);
    try {
      await deleteSubject(targetSubject.id, token);
      setSubjects((prev) => prev.filter((item) => item.id !== targetSubject.id));
      showSuccess('Disciplina removida');
    } catch (e) {
      showError('Erro ao remover disciplina', e instanceof Error ? e.message : undefined);
    } finally {
      setBusy(false);
      setTargetSubject(null);
    }
  }

  async function onSaveCard() {
    if (!selectedDeck || !cardQuestion.trim() || !cardAnswer.trim()) {
      showError('Preencha pergunta e resposta corretamente.');
      return;
    }
    setBusy(true);
    try {
      if (editingCardId) {
        const updated = await updateCardByAdmin(
          editingCardId,
          { question: cardQuestion.trim(), answer: cardAnswer.trim() },
          token
        );
        setCards((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
        showSuccess('Cartão atualizado');
      } else {
        const created = await createCardByAdmin(
          { deckId: selectedDeck.id, question: cardQuestion.trim(), answer: cardAnswer.trim() },
          token
        );
        setCards((prev) => [created, ...prev]);
        showSuccess('Cartão criado');
      }
      resetCardForm();
    } catch (e) {
      showError('Erro ao salvar cartão', e instanceof Error ? e.message : undefined);
    } finally {
      setBusy(false);
    }
  }

  async function onDeleteCard() {
    if (!targetCard) {
      return;
    }
    setBusy(true);
    try {
      await deleteCardByAdmin(targetCard.id, token);
      setCards((prev) => prev.filter((item) => item.id !== targetCard.id));
      showSuccess('Cartão removido');
    } catch (e) {
      showError('Erro ao remover cartão', e instanceof Error ? e.message : undefined);
    } finally {
      setBusy(false);
      setTargetCard(null);
    }
  }

  if (user?.role !== 'SUPERADMIN') {
    return (
      <View className="flex-1 items-center justify-center bg-background-light px-6 dark:bg-background-dark">
        <Text className="text-center font-medium text-base text-text-secondaryLight dark:text-text-secondaryDark">
          Esta área é exclusiva para administradores.
        </Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-background-light dark:bg-background-dark">
        <ActivityIndicator color="#2563EB" size="large" />
      </View>
    );
  }

  const breadcrumb =
    disciplinasView === 'decks' && selectedUser
      ? selectedUser.name
      : disciplinasView === 'cards' && selectedUser && selectedDeck
        ? `${selectedUser.name} › ${selectedDeck.subject}`
        : null;

  return (
    <View className="flex-1 bg-background-light px-4 py-4 dark:bg-background-dark">
      <View className="mb-3 flex-row gap-2">
        <Pressable
          className={`flex-1 rounded-lg py-2 ${mode === 'users' ? 'bg-primary' : 'border border-slate-300 bg-white dark:border-slate-600 dark:bg-surface-dark'}`}
          onPress={() => setMode('users')}
        >
          <Text className={`text-center font-medium ${mode === 'users' ? 'text-white' : 'text-text-light dark:text-text-dark'}`}>
            Usuários
          </Text>
        </Pressable>
        <Pressable
          className={`flex-1 rounded-lg py-2 ${mode === 'subjects' ? 'bg-primary' : 'border border-slate-300 bg-white dark:border-slate-600 dark:bg-surface-dark'}`}
          onPress={() => setMode('subjects')}
        >
          <Text className={`text-center font-medium ${mode === 'subjects' ? 'text-white' : 'text-text-light dark:text-text-dark'}`}>
            Disciplinas
          </Text>
        </Pressable>
      </View>

      {mode === 'users' && (
        <FlatList
          data={users}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <View className="mb-3 rounded-xl bg-surface-light p-4 dark:bg-surface-dark">
              <Text className="font-bold text-base text-text-light dark:text-text-dark">{item.name}</Text>
              <Text className="mt-1 font-bold italic text-sm text-text-secondaryLight dark:text-text-secondaryDark">
                {formatPublicId(item.publicId)}
              </Text>
              <Text className="mt-1 font-regular text-sm text-text-secondaryLight dark:text-text-secondaryDark">{item.email}</Text>
              <View className="mt-2 flex-row items-center justify-between">
                <Text className="font-medium text-xs text-text-secondaryLight dark:text-text-secondaryDark">{item.role}</Text>
                <Pressable className="rounded-lg border border-error px-3 py-1.5" onPress={() => setTargetUser(item)}>
                  <Text className="font-medium text-sm text-error">Excluir</Text>
                </Pressable>
              </View>
            </View>
          )}
        />
      )}

      {mode === 'subjects' && disciplinasView === 'users' && (
        <FlatList
          data={users}
          keyExtractor={(item) => String(item.id)}
          ListHeaderComponent={
            <Text className="mb-3 font-medium text-sm text-text-secondaryLight dark:text-text-secondaryDark">
              Selecione um usuário para ver as disciplinas
            </Text>
          }
          renderItem={({ item }) => (
            <Pressable
              className="mb-3 rounded-xl bg-surface-light p-4 dark:bg-surface-dark"
              onPress={() => onSelectUserForDisciplinas(item)}
            >
              <Text className="font-bold text-base text-text-light dark:text-text-dark">{item.name}</Text>
              <Text className="mt-1 font-bold italic text-sm text-text-secondaryLight dark:text-text-secondaryDark">
                {formatPublicId(item.publicId)}
              </Text>
              <Text className="mt-1 font-regular text-sm text-text-secondaryLight dark:text-text-secondaryDark">{item.email}</Text>
            </Pressable>
          )}
        />
      )}

      {mode === 'subjects' && disciplinasView === 'decks' && selectedUser && (
        <>
          <Pressable className="mb-3 self-start" onPress={onDisciplinasBack}>
            <Text className="font-medium text-primary">← Voltar</Text>
          </Pressable>
          {breadcrumb ? (
            <Text className="mb-3 font-medium text-sm text-text-secondaryLight dark:text-text-secondaryDark">{breadcrumb}</Text>
          ) : null}

          <View className="mb-3 rounded-xl bg-surface-light p-3 dark:bg-surface-dark">
            <Text className="mb-2 font-bold text-text-light dark:text-text-dark">
              {editingSubjectId ? 'Editar disciplina' : 'Nova disciplina'}
            </Text>
            <TextInput
              className="mb-2 rounded-lg border border-slate-300 px-3 py-2 text-text-light dark:border-slate-600 dark:text-text-dark"
              placeholder="Nome"
              placeholderTextColor="#64748B"
              value={subjectName}
              onChangeText={setSubjectName}
            />
            <TextInput
              className="mb-2 rounded-lg border border-slate-300 px-3 py-2 text-text-light dark:border-slate-600 dark:text-text-dark"
              placeholder="Disciplina"
              placeholderTextColor="#94A3B8"
              value={subjectTitle}
              onChangeText={setSubjectTitle}
            />
            <View className="mb-3 flex-row items-center justify-between">
              <Text className="text-text-secondaryLight dark:text-text-secondaryDark">Público</Text>
              <Switch value={subjectIsPublic} onValueChange={setSubjectIsPublic} />
            </View>
            <View className="flex-row gap-2">
              <Pressable className="flex-1 rounded-lg bg-primary py-2" onPress={onSaveSubject} disabled={busy}>
                <Text className="text-center font-medium text-white">{editingSubjectId ? 'Salvar' : 'Criar'}</Text>
              </Pressable>
              {editingSubjectId ? (
                <Pressable className="flex-1 rounded-lg border border-slate-300 py-2 dark:border-slate-600" onPress={resetSubjectForm}>
                  <Text className="text-center font-medium text-text-light dark:text-text-dark">Cancelar</Text>
                </Pressable>
              ) : null}
            </View>
          </View>

          <FlatList
            data={subjects}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }) => (
              <View className="mb-3 rounded-xl bg-surface-light p-4 dark:bg-surface-dark">
                <Pressable onPress={() => onSelectDeck(item)}>
                  <Text className="font-bold text-base text-text-light dark:text-text-dark">{item.subject}</Text>
                  <Text className="mt-1 font-regular text-sm text-text-secondaryLight dark:text-text-secondaryDark">{item.name}</Text>
                  <Text className="mt-2 font-medium text-sm text-primary">Ver cartões →</Text>
                </Pressable>
                <View className="mt-3 flex-row gap-2">
                  <Pressable
                    className="rounded-lg border border-primary px-3 py-1.5"
                    onPress={() => {
                      setEditingSubjectId(item.id);
                      setSubjectName(item.name);
                      setSubjectTitle(item.subject);
                      setSubjectIsPublic(item.isPublic);
                    }}
                  >
                    <Text className="font-medium text-primary">Editar</Text>
                  </Pressable>
                  <Pressable className="rounded-lg border border-error px-3 py-1.5" onPress={() => setTargetSubject(item)}>
                    <Text className="font-medium text-error">Excluir</Text>
                  </Pressable>
                </View>
              </View>
            )}
          />
        </>
      )}

      {mode === 'subjects' && disciplinasView === 'cards' && selectedDeck && (
        <>
          <Pressable className="mb-3 self-start" onPress={onDisciplinasBack}>
            <Text className="font-medium text-primary">← Voltar</Text>
          </Pressable>
          {breadcrumb ? (
            <Text className="mb-3 font-medium text-sm text-text-secondaryLight dark:text-text-secondaryDark">{breadcrumb}</Text>
          ) : null}

          <View className="mb-3 rounded-xl bg-surface-light p-3 dark:bg-surface-dark">
            <Text className="mb-2 font-bold text-text-light dark:text-text-dark">
              {editingCardId ? 'Editar cartão' : 'Novo cartão'}
            </Text>
            <TextInput
              className="mb-2 rounded-lg border border-slate-300 px-3 py-2 text-text-light dark:border-slate-600 dark:text-text-dark"
              placeholder="Pergunta"
              placeholderTextColor="#64748B"
              value={cardQuestion}
              onChangeText={setCardQuestion}
            />
            <TextInput
              className="mb-2 rounded-lg border border-slate-300 px-3 py-2 text-text-light dark:border-slate-600 dark:text-text-dark"
              placeholder="Resposta"
              placeholderTextColor="#64748B"
              value={cardAnswer}
              onChangeText={setCardAnswer}
            />
            <View className="flex-row gap-2">
              <Pressable className="flex-1 rounded-lg bg-primary py-2" onPress={onSaveCard} disabled={busy}>
                <Text className="text-center font-medium text-white">{editingCardId ? 'Salvar' : 'Criar'}</Text>
              </Pressable>
              {editingCardId ? (
                <Pressable className="flex-1 rounded-lg border border-slate-300 py-2 dark:border-slate-600" onPress={resetCardForm}>
                  <Text className="text-center font-medium text-text-light dark:text-text-dark">Cancelar</Text>
                </Pressable>
              ) : null}
            </View>
          </View>

          <FlatList
            data={cards}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }) => (
              <View className="mb-3 rounded-xl bg-surface-light p-4 dark:bg-surface-dark">
                <Text className="font-medium text-text-light dark:text-text-dark">{item.question}</Text>
                <Text className="mt-1 text-sm text-text-secondaryLight dark:text-text-secondaryDark">{item.answer}</Text>
                <View className="mt-3 flex-row gap-2">
                  <Pressable
                    className="rounded-lg border border-primary px-3 py-1.5"
                    onPress={() => {
                      setEditingCardId(item.id);
                      setCardQuestion(item.question);
                      setCardAnswer(item.answer);
                    }}
                  >
                    <Text className="font-medium text-primary">Editar</Text>
                  </Pressable>
                  <Pressable className="rounded-lg border border-error px-3 py-1.5" onPress={() => setTargetCard(item)}>
                    <Text className="font-medium text-error">Excluir</Text>
                  </Pressable>
                </View>
              </View>
            )}
          />
        </>
      )}

      <ConfirmModal
        visible={targetUser !== null}
        title="Excluir usuário"
        message={targetUser ? `Deseja excluir ${targetUser.email}?` : ''}
        confirmLabel="Excluir"
        cancelLabel="Cancelar"
        busy={busy}
        onCancel={() => setTargetUser(null)}
        onConfirm={onDeleteUser}
      />
      <ConfirmModal
        visible={targetSubject !== null}
        title="Excluir disciplina"
        message={targetSubject ? `Deseja excluir ${targetSubject.subject}?` : ''}
        confirmLabel="Excluir"
        cancelLabel="Cancelar"
        busy={busy}
        onCancel={() => setTargetSubject(null)}
        onConfirm={onDeleteSubject}
      />
      <ConfirmModal
        visible={targetCard !== null}
        title="Excluir cartão"
        message={targetCard ? 'Deseja excluir este cartão?' : ''}
        confirmLabel="Excluir"
        cancelLabel="Cancelar"
        busy={busy}
        onCancel={() => setTargetCard(null)}
        onConfirm={onDeleteCard}
      />
    </View>
  );
}
