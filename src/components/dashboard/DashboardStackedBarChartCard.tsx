import React from 'react';
import { Text, View } from 'react-native';

import type { DashboardSubjectStack } from '../../api/types';

type Props = {
  data: DashboardSubjectStack[];
};

const STACK_COLORS = {
  due: '#2563EB',
  scheduled: '#14B8A6',
  unscheduled: '#F59E0B',
};

function normalizePercents(dueCards: number, scheduledCards: number, unscheduledCards: number, total: number) {
  const safeTotal = Math.max(total, 1);
  const rawDue = (dueCards / safeTotal) * 100;
  const rawScheduled = (scheduledCards / safeTotal) * 100;
  const rawUnscheduled = (unscheduledCards / safeTotal) * 100;
  const sum = rawDue + rawScheduled + rawUnscheduled;
  if (sum <= 0) {
    return { duePercent: 0, scheduledPercent: 0, unscheduledPercent: 100 };
  }
  return {
    duePercent: (rawDue / sum) * 100,
    scheduledPercent: (rawScheduled / sum) * 100,
    unscheduledPercent: (rawUnscheduled / sum) * 100,
  };
}

export function DashboardStackedBarChartCard({ data }: Props) {
  const subjects = data.slice(0, 6);

  return (
    <View className="w-full overflow-hidden rounded-xl bg-surface-light p-4 dark:bg-surface-dark">
      <Text className="font-bold text-base text-text-light dark:text-text-dark">Status por disciplina</Text>
      {subjects.length === 0 ? (
        <Text className="mt-3 text-sm text-text-secondaryLight dark:text-text-secondaryDark">
          Sem disciplinas para exibir no momento.
        </Text>
      ) : (
        <View className="mt-4 gap-4">
          {subjects.map((subject) => {
            const unscheduledCards = Math.max(
              subject.totalCards - subject.dueCards - subject.scheduledCards,
              0,
            );
            const { duePercent, scheduledPercent, unscheduledPercent } = normalizePercents(
              subject.dueCards,
              subject.scheduledCards,
              unscheduledCards,
              subject.totalCards,
            );

            return (
              <View key={subject.subject}>
                <View className="mb-1 flex-row items-end justify-between gap-2">
                  <Text
                    className="min-w-0 flex-1 font-medium text-sm text-text-light dark:text-text-dark"
                    numberOfLines={1}
                  >
                    {subject.subject}
                  </Text>
                  <Text className="shrink-0 text-xs text-text-secondaryLight dark:text-text-secondaryDark">
                    {subject.totalCards} cartões
                  </Text>
                </View>
                <View className="h-3 w-full flex-row overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                  <View style={{ width: `${duePercent}%`, backgroundColor: STACK_COLORS.due }} />
                  <View style={{ width: `${scheduledPercent}%`, backgroundColor: STACK_COLORS.scheduled }} />
                  <View style={{ width: `${unscheduledPercent}%`, backgroundColor: STACK_COLORS.unscheduled }} />
                </View>
              </View>
            );
          })}

          <View className="mt-1 flex-row flex-wrap items-center gap-3">
            <LegendItem color={STACK_COLORS.due} label="Vencidos" />
            <LegendItem color={STACK_COLORS.scheduled} label="Agendados" />
            <LegendItem color={STACK_COLORS.unscheduled} label="Sem agendamento" />
          </View>
        </View>
      )}
    </View>
  );
}

type LegendItemProps = {
  color: string;
  label: string;
};

function LegendItem({ color, label }: LegendItemProps) {
  return (
    <View className="flex-row items-center gap-2">
      <View className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
      <Text className="text-xs text-text-secondaryLight dark:text-text-secondaryDark">{label}</Text>
    </View>
  );
}
