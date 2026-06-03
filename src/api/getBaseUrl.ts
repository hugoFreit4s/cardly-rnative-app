import Constants from 'expo-constants';
import { Platform } from 'react-native';

export function getApiBaseUrl(): string {
  const fromExtra = Constants.expoConfig?.extra?.apiBaseUrl;
  if (typeof fromExtra === 'string' && fromExtra.trim().length > 0) {
    return fromExtra.replace(/\/$/, '');
  }
  if (__DEV__) {
    if (Platform.OS === 'android') {
      return 'http://10.0.2.2:8080';
    }
    return 'http://localhost:8080';
  }
  return '';
}
