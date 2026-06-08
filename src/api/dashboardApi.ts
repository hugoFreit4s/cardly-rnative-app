import { apiRequest } from './client';
import type { DashboardChartsResponse, DashboardResponse, StudyCalendarResponse } from './types';

export function fetchDashboard(token: string | null): Promise<DashboardResponse> {
  return apiRequest<DashboardResponse>('/api/dashboard', { token });
}

export function fetchDashboardCharts(token: string | null): Promise<DashboardChartsResponse> {
  return apiRequest<DashboardChartsResponse>('/api/dashboard/charts', { token });
}

export function fetchStudyCalendar(token: string | null, limit = 120): Promise<StudyCalendarResponse> {
  return apiRequest<StudyCalendarResponse>(`/api/dashboard/calendar?limit=${limit}`, { token });
}
