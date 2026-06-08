import type { DifficultyLevel } from '../api/types';

export type DifficultyDisplay = {
  label: string;
  color: string;
  backgroundColor: string;
};

export function difficultyLabel(level: DifficultyLevel): DifficultyDisplay {
  switch (level) {
    case 'EASY':
      return { label: 'Fácil', color: '#15803D', backgroundColor: '#DCFCE7' };
    case 'MEDIUM':
      return { label: 'Médio', color: '#B45309', backgroundColor: '#FEF3C7' };
    case 'HARD':
      return { label: 'Difícil', color: '#B91C1C', backgroundColor: '#FEE2E2' };
    default:
      return { label: 'Novo', color: '#475569', backgroundColor: '#F1F5F9' };
  }
}
