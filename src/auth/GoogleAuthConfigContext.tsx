import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Platform } from 'react-native';

import { fetchAuthConfig } from '../api/authApi';
import { getGoogleClientConfig } from './googleConfig';

export type GoogleAuthConfigState = {
  ready: boolean;
  configured: boolean;
  webClientId: string;
  expoClientId: string;
  androidClientId: string;
  iosClientId: string;
};

const defaultState: GoogleAuthConfigState = {
  ready: false,
  configured: false,
  webClientId: '',
  expoClientId: '',
  androidClientId: '',
  iosClientId: '',
};

const GoogleAuthConfigContext = createContext<GoogleAuthConfigState>(defaultState);

function isConfiguredForPlatform(config: Omit<GoogleAuthConfigState, 'ready' | 'configured'>): boolean {
  if (Platform.OS === 'web') {
    return Boolean(config.webClientId);
  }
  if (Platform.OS === 'android') {
    return Boolean(config.androidClientId || config.expoClientId);
  }
  if (Platform.OS === 'ios') {
    return Boolean(config.iosClientId || config.expoClientId);
  }
  return false;
}

export function GoogleAuthConfigProvider({ children }: { children: React.ReactNode }) {
  const buildTime = getGoogleClientConfig();
  const [runtimeWebClientId, setRuntimeWebClientId] = useState('');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void fetchAuthConfig()
      .then((config) => {
        if (!cancelled && config.googleWebClientId) {
          setRuntimeWebClientId(config.googleWebClientId);
        }
      })
      .catch(() => {
      })
      .finally(() => {
        if (!cancelled) {
          setReady(true);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo(() => {
    const ids = {
      webClientId: buildTime.webClientId || runtimeWebClientId,
      expoClientId: buildTime.expoClientId,
      androidClientId: buildTime.androidClientId,
      iosClientId: buildTime.iosClientId,
    };
    return {
      ready,
      configured: isConfiguredForPlatform(ids),
      ...ids,
    };
  }, [buildTime, runtimeWebClientId, ready]);

  return <GoogleAuthConfigContext.Provider value={value}>{children}</GoogleAuthConfigContext.Provider>;
}

export function useGoogleAuthConfig(): GoogleAuthConfigState {
  return useContext(GoogleAuthConfigContext);
}
