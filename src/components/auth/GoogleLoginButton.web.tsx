import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import React from 'react';
import { ActivityIndicator, View } from 'react-native';

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

  async function handleCredential(idToken: string | undefined) {
    if (!idToken) {
      onError?.('Não foi possível obter o token do Google.');
      return;
    }
    onSubmittingChange?.(true);
    try {
      await signInWithGoogle(idToken);
    } catch (e) {
      onError?.(e instanceof Error ? e.message : 'Não foi possível entrar com Google.');
    } finally {
      onSubmittingChange?.(false);
    }
  }

  if (!config.webClientId) {
    return null;
  }

  if (submitting) {
    return (
      <View className="mt-3 min-h-[52px] items-center justify-center rounded-xl border border-slate-300 bg-white dark:border-slate-600 dark:bg-surface-dark">
        <ActivityIndicator color="#2563EB" />
      </View>
    );
  }

  return (
    <View className="mt-3 min-h-[52px] items-center justify-center overflow-hidden rounded-xl border border-slate-300 bg-white dark:border-slate-600 dark:bg-surface-dark">
      <GoogleOAuthProvider clientId={config.webClientId}>
        <GoogleLogin
          onSuccess={(response) => {
            void handleCredential(response.credential);
          }}
          onError={() => {
            onError?.('Não foi possível entrar com Google.');
          }}
          text="signin_with"
          shape="rectangular"
          theme="outline"
          size="large"
          width={320}
          useOneTap={false}
        />
      </GoogleOAuthProvider>
    </View>
  );
}
