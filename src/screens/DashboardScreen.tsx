import { useFocusEffect } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import { fetchDashboard, fetchDashboardCharts } from '../api/dashboardApi';
import type { DashboardChartsResponse, DashboardResponse } from '../api/types';
import { useAuth } from '../auth/AuthContext';
import { DashboardPieChartCard } from '../components/dashboard/DashboardPieChartCard';
import { DashboardStackedBarChartCard } from '../components/dashboard/DashboardStackedBarChartCard';
import { DashboardShell } from '../components/layout/DashboardShell';
import { showError } from '../components/ui/toast';

const initialDashboard: DashboardResponse = {
  totalSubjects: 0,
  totalCards: 0,
  dueCards: 0,
  answeredToday: 0,
};

const initialCharts: DashboardChartsResponse = {
  pie: [],
  stackedBySubject: [],
};

export function DashboardScreen() {
  const { token, user } = useAuth();
  const [dashboard, setDashboard] = useState<DashboardResponse>(initialDashboard);
  const [charts, setCharts] = useState<DashboardChartsResponse>(initialCharts);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'overview' | 'charts'>('overview');

  const loadDashboard = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [dashboardData, chartsData] = await Promise.all([fetchDashboard(token), fetchDashboardCharts(token)]);
      setDashboard(dashboardData);
      setCharts(chartsData);
    } catch (e) {
      showError('Não foi possível carregar o dashboard', e instanceof Error ? e.message : undefined);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  useFocusEffect(
    useCallback(() => {
      loadDashboard(true);
    }, [loadDashboard])
  );

  return (
    <DashboardShell>
      <View className="flex-1 px-5 py-5">
        <Text className="font-bold text-2xl text-text-light dark:text-text-dark">
          Olá, {user?.name ?? user?.email}
        </Text>
        <Text className="mt-1 font-regular text-text-secondaryLight dark:text-text-secondaryDark">
          Acompanhe seu progresso e inicie suas revisões.
        </Text>
        <View className="mt-4 flex-row justify-end gap-2">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Visualização por cartões"
            className={`h-9 w-9 items-center justify-center rounded-md border ${
              viewMode === 'overview'
                ? 'border-primary bg-primary/10 dark:bg-primary/20'
                : 'border-slate-300 bg-transparent dark:border-slate-600'
            }`}
            onPress={() => setViewMode('overview')}
          >
            <Feather name="layout" size={18} color={viewMode === 'overview' ? '#2563EB' : '#64748B'} />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Visualização por gráficos"
            className={`h-9 w-9 items-center justify-center rounded-md border ${
              viewMode === 'charts'
                ? 'border-primary bg-primary/10 dark:bg-primary/20'
                : 'border-slate-300 bg-transparent dark:border-slate-600'
            }`}
            onPress={() => setViewMode('charts')}
          >
            <Feather name="pie-chart" size={18} color={viewMode === 'charts' ? '#2563EB' : '#64748B'} />
          </Pressable>
        </View>

        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator color="#2563EB" size="large" />
          </View>
        ) : (
          <View className="mt-6 gap-3">
            {viewMode === 'overview' ? (
              <>
                <View className="rounded-xl bg-surface-light p-4 dark:bg-surface-dark">
                  <Text className="font-medium text-sm text-text-secondaryLight dark:text-text-secondaryDark">
                    Disciplinas
                  </Text>
                  <Text className="mt-1 font-bold text-3xl text-text-light dark:text-text-dark">
                    {dashboard.totalSubjects}
                  </Text>
                </View>
                <View className="rounded-xl bg-surface-light p-4 dark:bg-surface-dark">
                  <Text className="font-medium text-sm text-text-secondaryLight dark:text-text-secondaryDark">
                    Cartões totais
                  </Text>
                  <Text className="mt-1 font-bold text-3xl text-text-light dark:text-text-dark">
                    {dashboard.totalCards}
                  </Text>
                </View>
                <View className="rounded-xl bg-surface-light p-4 dark:bg-surface-dark">
                  <Text className="font-medium text-sm text-text-secondaryLight dark:text-text-secondaryDark">
                    Cartões disponíveis agora
                  </Text>
                  <Text className="mt-1 font-bold text-3xl text-primary">{dashboard.dueCards}</Text>
                </View>
                <View className="rounded-xl bg-surface-light p-4 dark:bg-surface-dark">
                  <Text className="font-medium text-sm text-text-secondaryLight dark:text-text-secondaryDark">
                    Respondidos hoje
                  </Text>
                  <Text className="mt-1 font-bold text-3xl text-success">{dashboard.answeredToday}</Text>
                </View>
              </>
            ) : (
              <>
                <DashboardPieChartCard data={charts.pie} />
                <DashboardStackedBarChartCard data={charts.stackedBySubject} />
              </>
            )}
          </View>
        )}
      </View>
    </DashboardShell>
  );
}
