import type { Card } from '../api/types';

export function deckHasStudyProgress(cards: Card[]): boolean {
  return cards.some(
    (card) =>
      card.difficultyLevel !== 'NONE' ||
      card.dueAt != null ||
      card.rightStreak > 0 ||
      card.wrongStreak > 0,
  );
}

export function deckStudyActionLabel(cards: Card[]): string {
  return deckHasStudyProgress(cards)
    ? 'Iniciar revisão desta disciplina'
    : 'Iniciar estudo desta disciplina';
}
