import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
} from 'react-native';

import { useAuth } from '../auth/AuthContext';
import { PasswordInput } from '../components/ui/PasswordInput';
import type { AuthStackParamList } from '../navigation/AuthStack';
import { isValidEmail, isValidPassword } from './validation';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

export function RegisterScreen({ navigation }: Props) {
  const { signUp } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit() {
    setError(null);
    if (!name.trim()) {
      setError('Informe seu nome.');
      return;
    }
    if (!isValidEmail(email)) {
      setError('Informe um e-mail válido.');
      return;
    }
    if (!isValidPassword(password)) {
      setError('A senha deve ter pelo menos 8 caracteres.');
      return;
    }
    setSubmitting(true);
    try {
      await signUp(name, email, password);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Não foi possível criar a conta.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-background-light dark:bg-background-dark"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text className="mb-5 text-center font-medium text-base text-text-secondaryLight dark:text-text-secondaryDark">
          Contas removidas anteriormente podem ser reativadas ao registrar de novo com o mesmo e-mail e
          uma nova senha.
        </Text>
        <TextInput
          className="mb-3 rounded-xl border border-slate-300 bg-surface-light px-4 py-3 font-regular text-base text-text-light dark:border-slate-600 dark:bg-surface-dark dark:text-text-dark"
          placeholder="Nome"
          placeholderTextColor="#94A3B8"
          autoCapitalize="words"
          value={name}
          onChangeText={setName}
          editable={!submitting}
        />
        <TextInput
          className="mb-3 rounded-xl border border-slate-300 bg-surface-light px-4 py-3 font-regular text-base text-text-light dark:border-slate-600 dark:bg-surface-dark dark:text-text-dark"
          placeholder="E-mail"
          placeholderTextColor="#94A3B8"
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          editable={!submitting}
        />
        <PasswordInput
          placeholder="Senha (mín. 8 caracteres)"
          value={password}
          onChangeText={setPassword}
          editable={!submitting}
        />
        {error ? (
          <Text className="mb-3 font-regular text-sm text-error">{error}</Text>
        ) : null}
        <Pressable
          className="mt-2 min-h-[52px] items-center justify-center rounded-xl bg-primary active:bg-primary-hover"
          onPress={onSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text className="font-medium text-base text-white">Criar conta</Text>
          )}
        </Pressable>
        <Pressable
          className="mt-5 items-center"
          onPress={() => navigation.navigate('Login')}
          disabled={submitting}
        >
          <Text className="font-regular text-base text-primary">Já tenho conta</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
