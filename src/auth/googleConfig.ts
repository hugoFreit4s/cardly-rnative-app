import Constants from 'expo-constants';
import { Platform } from 'react-native';

export type GoogleClientConfig = {
  expoClientId: string;
  androidClientId: string;
  iosClientId: string;
  webClientId: string;
};

export function getGoogleClientConfig(): GoogleClientConfig {
  const extra = Constants.expoConfig?.extra ?? {};
  return {
    expoClientId: typeof extra.googleExpoClientId === 'string' ? extra.googleExpoClientId : '',
    androidClientId: typeof extra.googleAndroidClientId === 'string' ? extra.googleAndroidClientId : '',
    iosClientId: typeof extra.googleIosClientId === 'string' ? extra.googleIosClientId : '',
    webClientId: typeof extra.googleWebClientId === 'string' ? extra.googleWebClientId : '',
  };
}

export function isGoogleAuthConfigured(): boolean {
  const config = getGoogleClientConfig();
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
