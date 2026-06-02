/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2563EB',
          hover: '#1D4ED8',
        },
        background: {
          light: '#F8FAFC',
          dark: '#0F172A',
        },
        surface: {
          light: '#FFFFFF',
          dark: '#1E293B',
        },
        text: {
          light: '#0F172A',
          dark: '#F8FAFC',
          secondaryLight: '#64748B',
          secondaryDark: '#CBD5E1',
        },
        success: '#22C55E',
        warning: '#F59E0B',
        error: '#EF4444',
      },
      fontFamily: {
        regular: ['DMSans_400Regular'],
        medium: ['DMSans_500Medium'],
        bold: ['DMSans_700Bold'],
      },
    },
  },
  plugins: [],
};
