import type { ConfigContext, ExpoConfig } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => {
  const plugins = [...(config.plugins ?? []), 'expo-web-browser'];
  return {
    ...config,
    name: config.name ?? 'Cardly',
    scheme: config.scheme ?? 'cardly',
    plugins,
    extra: {
      ...config.extra,
      apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL ?? '',
      googleExpoClientId: process.env.EXPO_PUBLIC_GOOGLE_EXPO_CLIENT_ID ?? '',
      googleAndroidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID ?? '',
      googleIosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ?? '',
      googleWebClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? '',
    },
  } as ExpoConfig;
};
