import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import { fetchStudyCalendar } from '../api/dashboardApi';
import { useAuth } from '../auth/AuthContext';
import { showError } from '../components/ui/toast';

function monthLabel(date: Date): string {
  return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
}

function monthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function localDayKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function buildMonthCells(baseDate: Date): Date[] {
  const first = new Date(baseDate.getFullYear(), baseDate.getMonth(), 1);
  const startDay = first.getDay();
  const gridStart = new Date(first);
  gridStart.setDate(first.getDate() - startDay);
  return Array.from({ length: 42 }, (_, idx) => {
    const d = new Date(gridStart);
    d.setDate(gridStart.getDate() + idx);
    return d;
  });
}

export function CalendarScreen() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [studyDays, setStudyDays] = useState<Set<string>>(new Set());
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await fetchStudyCalendar(token, 240);
        setStudyDays(new Set(data.days));
      } catch (e) {
        showError('Erro ao carregar calendário', e instanceof Error ? e.message : undefined);
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  const cells = useMemo(() => buildMonthCells(currentMonth), [currentMonth]);
  const activeMonth = monthKey(currentMonth);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-background-light dark:bg-background-dark">
        <ActivityIndicator color="#2563EB" size="large" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background-light px-4 py-4 dark:bg-background-dark">
      <View className="mb-4 flex-row items-center justify-between">
        <Pressable
          className="rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-600"
          onPress={() => {
            const prev = new Date(currentMonth);
            prev.setMonth(prev.getMonth() - 1);
            setCurrentMonth(prev);
          }}
        >
          <Text className="font-medium text-text-secondaryLight dark:text-text-secondaryDark">Anterior</Text>
        </Pressable>
        <Text className="font-bold text-base capitalize text-text-light dark:text-text-dark">{monthLabel(currentMonth)}</Text>
        <Pressable
          className="rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-600"
          onPress={() => {
            const next = new Date(currentMonth);
            next.setMonth(next.getMonth() + 1);
            setCurrentMonth(next);
          }}
        >
          <Text className="font-medium text-text-secondaryLight dark:text-text-secondaryDark">Próximo</Text>
        </Pressable>
      </View>

      <View className="mb-2 flex-row justify-between">
        {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((day, idx) => (
          <Text key={`${day}-${idx}`} className="w-10 text-center font-medium text-text-secondaryLight dark:text-text-secondaryDark">
            {day}
          </Text>
        ))}
      </View>

      <View className="flex-row flex-wrap gap-y-2">
        {cells.map((dateObj) => {
          const dayKey = localDayKey(dateObj);
          const isCurrentMonth = monthKey(dateObj) === activeMonth;
          const isStudied = studyDays.has(dayKey);
          return (
            <View key={dayKey} style={{ width: '14.2857%', alignItems: 'center' }}>
              <View
                className={`h-9 w-9 items-center justify-center rounded-full ${
                  isStudied ? 'bg-primary' : 'bg-transparent'
                }`}
              >
                <Text
                  className={`font-regular text-sm ${
                    isStudied
                      ? 'text-white'
                      : isCurrentMonth
                        ? 'text-text-light dark:text-text-dark'
                        : 'text-slate-300 dark:text-slate-600'
                  }`}
                >
                  {dateObj.getDate()}
                </Text>
              </View>
            </View>
          );
        })}
      </View>

      <View className="mt-5 flex-row items-center">
        <View className="mr-2 h-3 w-3 rounded-full bg-primary" />
        <Text className="font-regular text-sm text-text-secondaryLight dark:text-text-secondaryDark">Dias com revisão realizada</Text>
      </View>
    </View>
  );
}
