import { useGoogleAuthConfig } from './GoogleAuthConfigContext';

export function useGoogleAuthAvailable(): boolean {
  const config = useGoogleAuthConfig();
  return config.ready && config.configured;
}
