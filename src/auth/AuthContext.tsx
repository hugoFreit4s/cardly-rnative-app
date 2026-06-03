import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import {
  deleteAccount,
  getMe,
  googleLogin,
  login as loginApi,
  logoutRemote,
  register as registerApi,
  updateProfile as updateProfileApi,
} from '../api/authApi';
import type { MeResponse, UpdateProfileBody } from '../api/types';
import { clearToken, readToken, writeToken } from './tokenStorage';

type AuthContextValue = {
  user: MeResponse | null;
  token: string | null;
  ready: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: (idToken: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  updateProfile: (body: UpdateProfileBody) => Promise<void>;
  signOut: () => Promise<void>;
  removeAccount: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<MeResponse | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const stored = await readToken();
      if (cancelled) {
        return;
      }
      if (!stored) {
        setReady(true);
        return;
      }
      setToken(stored);
      try {
        const me = await getMe(stored);
        if (!cancelled) {
          setUser(me);
        }
      } catch {
        await clearToken();
        if (!cancelled) {
          setToken(null);
          setUser(null);
        }
      } finally {
        if (!cancelled) {
          setReady(true);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const auth = await loginApi({ email: email.trim(), password });
    await writeToken(auth.token);
    setToken(auth.token);
    const me = await getMe(auth.token);
    setUser(me);
  }, []);

  const signInWithGoogle = useCallback(async (idToken: string) => {
    const auth = await googleLogin({ idToken });
    await writeToken(auth.token);
    setToken(auth.token);
    const me = await getMe(auth.token);
    setUser(me);
  }, []);

  const signUp = useCallback(async (name: string, email: string, password: string) => {
    const auth = await registerApi({
      name: name.trim(),
      email: email.trim(),
      password,
    });
    await writeToken(auth.token);
    setToken(auth.token);
    const me = await getMe(auth.token);
    setUser(me);
  }, []);

  const updateProfile = useCallback(
    async (body: UpdateProfileBody) => {
      if (!token) {
        throw new Error('Sessão expirada.');
      }
      const updated = await updateProfileApi(body, token);
      setUser(updated);
    },
    [token]
  );

  const signOut = useCallback(async () => {
    try {
      await logoutRemote();
    } catch {}
    await clearToken();
    setToken(null);
    setUser(null);
  }, []);

  const removeAccount = useCallback(async () => {
    if (token) {
      await deleteAccount(token);
    }
    await clearToken();
    setToken(null);
    setUser(null);
  }, [token]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      ready,
      signIn,
      signInWithGoogle,
      signUp,
      updateProfile,
      signOut,
      removeAccount,
    }),
    [user, token, ready, signIn, signInWithGoogle, signUp, updateProfile, signOut, removeAccount],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth só pode ser usado dentro de AuthProvider');
  }
  return ctx;
}
