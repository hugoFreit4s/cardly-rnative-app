import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as WebBrowser from 'expo-web-browser';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';

import { useAuth } from '../auth/AuthContext';
import { useGoogleAuthAvailable } from '../auth/useGoogleAuthAvailable';
import { GoogleLoginButton } from '../components/auth/GoogleLoginButton';
import { CardlyLogo } from '../components/CardlyLogo';
import { PasswordInput } from '../components/ui/PasswordInput';
import type { AuthStackParamList } from '../navigation/AuthStack';
import { isValidEmail, isValidPassword } from './validation';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

WebBrowser.maybeCompleteAuthSession();

export function LoginScreen({ navigation }: Props) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [googleSubmitting, setGoogleSubmitting] = useState(false);

  const googleAuthAvailable = useGoogleAuthAvailable();

  async function onSubmit() {
    setError(null);
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
      await signIn(email, password);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Não foi possível entrar.');
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
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 24, paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="mb-7 items-center">
          <CardlyLogo width={80} height={80} color="#2563EB" accentColor="#2563EB" />
          <Text className="mt-4 font-bold text-3xl text-text-light dark:text-text-dark">Cardly</Text>
          <Text className="mt-1 text-center font-medium text-base text-text-secondaryLight dark:text-text-secondaryDark">
            Entre para continuar
          </Text>
        </View>
        <TextInput
          className="mb-3 rounded-xl border border-slate-300 bg-surface-light px-4 py-3 font-regular text-base text-text-light dark:border-slate-600 dark:bg-surface-dark dark:text-text-dark"
          placeholder="E-mail"
          placeholderTextColor="#94A3B8"
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          editable={!submitting && !googleSubmitting}
        />
        <PasswordInput
          placeholder="Senha"
          value={password}
          onChangeText={setPassword}
          editable={!submitting && !googleSubmitting}
        />
        {error ? (
          <Text className="mb-3 font-regular text-sm text-error">{error}</Text>
        ) : null}
        <Pressable
          className="mt-2 min-h-[52px] items-center justify-center rounded-xl bg-primary active:bg-primary-hover"
          onPress={onSubmit}
          disabled={submitting || googleSubmitting}
        >
          {submitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text className="font-medium text-base text-white">Entrar</Text>
          )}
        </Pressable>
        {googleAuthAvailable ? (
          <GoogleLoginButton
            disabled={submitting}
            submitting={googleSubmitting}
            onSubmittingChange={setGoogleSubmitting}
            onError={(message) => setError(message)}
          />
        ) : null}
        <Pressable
          className="mt-5 items-center"
          onPress={() => navigation.navigate('Register')}
          disabled={submitting || googleSubmitting}
        >
          <Text className="font-regular text-base text-primary">Criar conta</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
