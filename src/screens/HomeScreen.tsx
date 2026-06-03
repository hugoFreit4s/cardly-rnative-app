import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { useAuth } from '../auth/AuthContext';
import { CardlyLogo } from '../components/CardlyLogo';
import { fontFamily, typography, useThemeColors, type ThemeColors } from '../theme';

function roleLabel(role: string): string {
  if (role === 'SUPERADMIN') {
    return 'Superadmin';
  }
  return 'Usuário';
}

export function HomeScreen() {
  const { user, signOut } = useAuth();
  const [busy, setBusy] = useState(false);
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  async function onLogout() {
    setBusy(true);
    try {
      await signOut();
    } finally {
      setBusy(false);
    }
  }

  if (!user) {
    return null;
  }

  return (
    <View style={styles.container}>
      <CardlyLogo width={96} height={96} color={colors.primary} accentColor={colors.accent} />
      <Text style={[typography.title, styles.title]}>Cardly</Text>
      <Text style={[typography.body, styles.line]}>{user.email}</Text>
      <Text style={[typography.caption, styles.muted]}>Perfil: {roleLabel(user.role)}</Text>
      <Pressable
        style={({ pressed }) => [styles.outlineBtn, pressed && styles.outlineBtnPressed]}
        onPress={onLogout}
        disabled={busy}
      >
        {busy ? (
          <ActivityIndicator color={colors.primary} />
        ) : (
          <Text style={styles.outlineBtnText}>Sair</Text>
        )}
      </Pressable>
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 24,
    },
    title: {
      marginTop: 16,
      color: colors.text,
    },
    line: {
      marginTop: 12,
      color: colors.text,
      textAlign: 'center',
    },
    muted: {
      marginTop: 6,
      color: colors.textMuted,
    },
    outlineBtn: {
      marginTop: 32,
      borderWidth: 2,
      borderColor: colors.primary,
      borderRadius: 12,
      paddingVertical: 14,
      paddingHorizontal: 32,
      minWidth: 160,
      alignItems: 'center',
    },
    outlineBtnPressed: {
      opacity: 0.85,
    },
    outlineBtnText: {
      fontFamily: fontFamily.medium,
      fontSize: 16,
      color: colors.primary,
    },
  });
}
