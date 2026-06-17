import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';

import type { DifficultyLevel } from '../../api/types';
import { useThemeColors, type ThemeColors } from '../../theme';
import { difficultyLabel } from '../../utils/difficulty';

type Props = {
  question: string;
  answer: string;
  flipped: boolean;
  onToggle: () => void;
  onFlipToFrontComplete?: () => void;
  difficultyLevel?: DifficultyLevel;
  rightStreak?: number;
  wrongStreak?: number;
};

export function FlipCard({
  question,
  answer,
  flipped,
  onToggle,
  onFlipToFrontComplete,
  difficultyLevel,
  rightStreak = 0,
  wrongStreak = 0,
}: Props) {
  const colors = useThemeColors();
  const styles = React.useMemo(() => createStyles(colors), [colors]);
  const rotate = useRef(new Animated.Value(0)).current;
  const wasFlippedRef = useRef(flipped);

  useEffect(() => {
    const wasFlipped = wasFlippedRef.current;
    wasFlippedRef.current = flipped;

    Animated.spring(rotate, {
      toValue: flipped ? 1 : 0,
      useNativeDriver: true,
      friction: 8,
      tension: 60,
    }).start(({ finished }) => {
      if (finished && wasFlipped && !flipped) {
        onFlipToFrontComplete?.();
      }
    });
  }, [flipped, onFlipToFrontComplete, rotate]);

  const frontInterpolate = rotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const backInterpolate = rotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['180deg', '360deg'],
  });

  const difficulty = difficultyLabel(difficultyLevel ?? 'NONE');

  return (
    <Pressable onPress={onToggle} style={styles.wrapper}>
      <View style={styles.container}>
        <Animated.View
          style={[
            styles.face,
            styles.frontFace,
            {
              transform: [{ rotateY: frontInterpolate }],
              backfaceVisibility: 'hidden',
            },
          ]}
        >
          <View style={styles.faceInner}>
            <Text
              style={[
                styles.difficultyBadge,
                { color: difficulty.color, backgroundColor: difficulty.backgroundColor },
              ]}
            >
              {difficulty.label}
            </Text>
            <Text style={styles.streakText}>Streak: {rightStreak} acertos / {wrongStreak} erros</Text>
            <Text style={styles.label}>Pergunta</Text>
            <Text style={styles.questionText}>{question}</Text>
            <Text style={styles.hint}>Toque para ver a resposta</Text>
          </View>
        </Animated.View>

        <Animated.View
          style={[
            styles.face,
            styles.backFace,
            {
              transform: [{ rotateY: backInterpolate }],
              backfaceVisibility: 'hidden',
            },
          ]}
        >
          <View style={styles.faceInner}>
            <Text style={[styles.difficultyBadge, styles.backDifficultyBadge]}>{difficulty.label}</Text>
            <Text style={[styles.streakText, styles.backStreakText]}>
              Streak: {rightStreak} acertos / {wrongStreak} erros
            </Text>
            <Text style={styles.backLabel}>Resposta</Text>
            <Text style={styles.answerText}>{answer}</Text>
            <Text style={styles.backHint}>Toque para voltar</Text>
          </View>
        </Animated.View>
      </View>
    </Pressable>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    wrapper: {
      height: 256,
      width: '100%',
    },
    container: {
      position: 'relative',
      height: '100%',
      width: '100%',
    },
    face: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      borderRadius: 4,
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.18,
      shadowRadius: 14,
      elevation: 5,
    },
    frontFace: {
      borderWidth: 2,
      borderColor: `${colors.primary}4D`,
      backgroundColor: colors.surface,
    },
    backFace: {
      backgroundColor: colors.primary,
    },
    faceInner: {
      flex: 1,
      padding: 24,
      justifyContent: 'space-between',
    },
    difficultyBadge: {
      alignSelf: 'flex-start',
      borderRadius: 4,
      paddingHorizontal: 8,
      paddingVertical: 2,
      fontFamily: 'DMSans_500Medium',
      fontSize: 12,
      marginBottom: 8,
    },
    backDifficultyBadge: {
      color: '#FFFFFF',
      backgroundColor: 'rgba(255,255,255,0.2)',
    },
    streakText: {
      fontFamily: 'DMSans_400Regular',
      fontSize: 12,
      color: colors.textMuted,
      marginBottom: 6,
    },
    backStreakText: {
      color: '#DBEAFE',
    },
    label: {
      fontFamily: 'DMSans_700Bold',
      fontSize: 12,
      letterSpacing: 1,
      textTransform: 'uppercase',
      color: colors.primary,
    },
    questionText: {
      flex: 1,
      marginTop: 12,
      fontFamily: 'DMSans_700Bold',
      fontSize: 24,
      color: colors.text,
    },
    hint: {
      fontFamily: 'DMSans_400Regular',
      fontSize: 14,
      color: colors.textMuted,
      marginTop: 12,
    },
    backLabel: {
      fontFamily: 'DMSans_700Bold',
      fontSize: 12,
      letterSpacing: 1,
      textTransform: 'uppercase',
      color: '#DBEAFE',
    },
    answerText: {
      flex: 1,
      marginTop: 12,
      fontFamily: 'DMSans_700Bold',
      fontSize: 24,
      color: '#FFFFFF',
    },
    backHint: {
      fontFamily: 'DMSans_400Regular',
      fontSize: 14,
      color: '#DBEAFE',
      marginTop: 12,
    },
  });
}
