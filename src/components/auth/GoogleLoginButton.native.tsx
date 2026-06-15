import * as Google from 'expo-auth-session/providers/google';
import React, { useEffect } from 'react';
import { ActivityIndicator, Pressable, Text } from 'react-native';

import { useAuth } from '../../auth/AuthContext';
import { useGoogleAuthConfig } from '../../auth/GoogleAuthConfigContext';

type Props = {
  disabled?: boolean;
  submitting?: boolean;
  onSubmittingChange?: (submitting: boolean) => void;
  onError?: (message: string) => void;
};

export function GoogleLoginButton({
  disabled = false,
  submitting = false,
  onSubmittingChange,
  onError,
}: Props) {
  const { signInWithGoogle } = useAuth();
  const config = useGoogleAuthConfig();

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: config.expoClientId || undefined,
    androidClientId: config.androidClientId || undefined,
    iosClientId: config.iosClientId || undefined,
    webClientId: config.webClientId || undefined,
  });

  useEffect(() => {
    if (response?.type !== 'success') {
      return;
    }
    const idToken =
      (response.params?.id_token as string | undefined) ?? response.authentication?.idToken;
    if (!idToken) {
      onError?.('Não foi possível obter o token do Google.');
      return;
    }
    onSubmittingChange?.(true);
    signInWithGoogle(idToken)
      .catch((e) => {
        onError?.(e instanceof Error ? e.message : 'Não foi possível entrar com Google.');
      })
      .finally(() => {
        onSubmittingChange?.(false);
      });
  }, [response, signInWithGoogle, onError, onSubmittingChange]);

  return (
    <Pressable
      className="mt-3 min-h-[52px] items-center justify-center rounded-xl border border-slate-300 bg-white dark:border-slate-600 dark:bg-surface-dark"
      onPress={() => promptAsync()}
      disabled={disabled || submitting || !request}
    >
      {submitting ? (
        <ActivityIndicator color="#2563EB" />
      ) : (
        <Text className="font-medium text-base text-text-light dark:text-text-dark">Entrar com Google</Text>
      )}
    </Pressable>
  );
}
