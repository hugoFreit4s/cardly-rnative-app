import { Feather } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import React, { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import { useAuth } from '../auth/AuthContext';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { PasswordInput } from '../components/ui/PasswordInput';
import { showError, showSuccess } from '../components/ui/toast';

function initialsFrom(value: string): string {
  const parts = value.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return '?';
  }
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function roleLabel(role: string): string {
  return role === 'SUPERADMIN' ? 'Administrador' : 'Usuário';
}

export function ProfileScreen() {
  const { user, updateProfile, removeAccount, signOut } = useAuth();

  const [name, setName] = useState(user?.name ?? '');
  const [savingName, setSavingName] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  const [confirmVisible, setConfirmVisible] = useState(false);
  const [removing, setRemoving] = useState(false);

  const displayName = user?.name ?? user?.email ?? '';

  async function onCopyPublicId() {
    if (!user?.publicId) {
      return;
    }
    await Clipboard.setStringAsync(`#${user.publicId}`);
    showSuccess('ID copiado');
  }

  async function onSaveName() {
    if (!name.trim()) {
      showError('Informe um nome válido.');
      return;
    }
    setSavingName(true);
    try {
      await updateProfile({ name: name.trim() });
      showSuccess('Nome atualizado');
    } catch (e) {
      showError('Não foi possível atualizar o nome', e instanceof Error ? e.message : undefined);
    } finally {
      setSavingName(false);
    }
  }

  async function onChangePassword() {
    if (newPassword.length < 8) {
      showError('A nova senha deve ter pelo menos 8 caracteres.');
      return;
    }
    if (!currentPassword) {
      showError('Informe sua senha atual.');
      return;
    }
    setSavingPassword(true);
    try {
      await updateProfile({ currentPassword, newPassword });
      setCurrentPassword('');
      setNewPassword('');
      showSuccess('Senha alterada');
    } catch (e) {
      showError('Não foi possível alterar a senha', e instanceof Error ? e.message : undefined);
    } finally {
      setSavingPassword(false);
    }
  }

  async function onRemoveAccount() {
    setRemoving(true);
    try {
      await removeAccount();
      showSuccess('Conta removida');
    } catch (e) {
      showError('Não foi possível remover a conta', e instanceof Error ? e.message : undefined);
    } finally {
      setRemoving(false);
      setConfirmVisible(false);
    }
  }

  return (
    <ScrollView
      className="flex-1 bg-background-light dark:bg-background-dark"
      contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
      keyboardShouldPersistTaps="handled"
    >
      <View className="items-center">
        <View className="h-24 w-24 items-center justify-center rounded-full bg-primary">
          <Text className="font-bold text-3xl text-white">{initialsFrom(displayName)}</Text>
        </View>
        <Text className="mt-4 font-bold text-2xl text-text-light dark:text-text-dark">{displayName}</Text>
        {user?.publicId ? (
          <View className="mt-1 flex-row items-center gap-2">
            <Text className="font-bold italic text-base text-text-secondaryLight dark:text-text-secondaryDark">
              #{user.publicId}
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Copiar ID"
              onPress={onCopyPublicId}
              hitSlop={8}
            >
              <Feather name="copy" size={16} color="#64748B" />
            </Pressable>
          </View>
        ) : null}
        <Text className="mt-1 font-regular text-base text-text-secondaryLight dark:text-text-secondaryDark">
          {user?.email}
        </Text>
        <View className="mt-2 rounded-full bg-primary/10 px-3 py-1 dark:bg-primary/20">
          <Text className="font-medium text-xs text-primary">{roleLabel(user?.role ?? 'USER')}</Text>
        </View>
      </View>

      <View className="mt-8 rounded-2xl border border-slate-200 bg-surface-light p-4 dark:border-slate-700 dark:bg-surface-dark">
        <Text className="mb-3 font-bold text-base text-text-light dark:text-text-dark">Dados pessoais</Text>
        <TextInput
          className="mb-3 rounded-xl border border-slate-300 bg-surface-light px-4 py-3 font-regular text-base text-text-light dark:border-slate-600 dark:bg-background-dark dark:text-text-dark"
          placeholder="Nome"
          placeholderTextColor="#94A3B8"
          value={name}
          onChangeText={setName}
          editable={!savingName}
        />
        <Pressable
          className="min-h-[48px] items-center justify-center rounded-xl bg-primary active:bg-primary-hover disabled:opacity-50"
          onPress={onSaveName}
          disabled={savingName}
        >
          {savingName ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text className="font-medium text-base text-white">Salvar nome</Text>
          )}
        </Pressable>
      </View>

      <View className="mt-5 rounded-2xl border border-slate-200 bg-surface-light p-4 dark:border-slate-700 dark:bg-surface-dark">
        <Text className="mb-3 font-bold text-base text-text-light dark:text-text-dark">Alterar senha</Text>
        <PasswordInput
          placeholder="Senha atual"
          value={currentPassword}
          onChangeText={setCurrentPassword}
          editable={!savingPassword}
        />
        <PasswordInput
          placeholder="Nova senha (mín. 8 caracteres)"
          value={newPassword}
          onChangeText={setNewPassword}
          editable={!savingPassword}
        />
        <Pressable
          className="mt-1 min-h-[48px] items-center justify-center rounded-xl bg-primary active:bg-primary-hover disabled:opacity-50"
          onPress={onChangePassword}
          disabled={savingPassword}
        >
          {savingPassword ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text className="font-medium text-base text-white">Alterar senha</Text>
          )}
        </Pressable>
      </View>

      <View className="mt-5 gap-3">
        <Pressable
          className="min-h-[48px] items-center justify-center rounded-xl border border-slate-300 dark:border-slate-600"
          onPress={signOut}
        >
          <Text className="font-medium text-base text-text-light dark:text-text-dark">Sair</Text>
        </Pressable>
        <Pressable
          className="min-h-[48px] items-center justify-center rounded-xl border border-error"
          onPress={() => setConfirmVisible(true)}
        >
          <Text className="font-medium text-base text-error">Excluir conta</Text>
        </Pressable>
      </View>

      <ConfirmModal
        visible={confirmVisible}
        title="Excluir conta"
        message="Esta ação remove sua conta e todos os seus dados."
        confirmLabel="Excluir"
        cancelLabel="Cancelar"
        busy={removing}
        onCancel={() => setConfirmVisible(false)}
        onConfirm={onRemoveAccount}
      />
    </ScrollView>
  );
}
