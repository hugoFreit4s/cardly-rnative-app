export type ThemeColors = {
  primary: string;
  primaryDark: string;
  background: string;
  surface: string;
  surfaceAlt: string;
  text: string;
  textMuted: string;
  border: string;
  accent: string;
  success: string;
  warning: string;
  error: string;
};

export const lightColors: ThemeColors = {
  primary: '#2563EB',
  primaryDark: '#1D4ED8',
  background: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceAlt: '#EEF2F7',
  text: '#0F172A',
  textMuted: '#64748B',
  border: '#CBD5E1',
  accent: '#2563EB',
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
};

export const darkColors: ThemeColors = {
  primary: '#3B82F6',
  primaryDark: '#2563EB',
  background: '#0F172A',
  surface: '#1E293B',
  surfaceAlt: '#273449',
  text: '#F8FAFC',
  textMuted: '#CBD5E1',
  border: '#334155',
  accent: '#3B82F6',
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#F87171',
};

export const colors = lightColors;

export function getColors(scheme: 'light' | 'dark'): ThemeColors {
  return scheme === 'dark' ? darkColors : lightColors;
}

export type ColorName = keyof ThemeColors;
