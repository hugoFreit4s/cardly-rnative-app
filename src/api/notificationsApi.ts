import { apiRequest } from './client';
import type { Notification, NotificationSummary } from './types';

export function fetchNotifications(token: string | null): Promise<Notification[]> {
  return apiRequest<Notification[]>('/api/notifications', { token });
}

export function fetchNotificationSummary(token: string | null): Promise<NotificationSummary> {
  return apiRequest<NotificationSummary>('/api/notifications/summary', { token });
}

export function markAllNotificationsRead(token: string | null): Promise<void> {
  return apiRequest<void>('/api/notifications/read-all', { method: 'POST', token });
}

export function markNotificationsRead(ids: number[], token: string | null): Promise<void> {
  return apiRequest<void>('/api/notifications/mark-read', {
    method: 'POST',
    token,
    body: { ids },
  });
}

export function deleteNotifications(ids: number[], token: string | null): Promise<void> {
  return apiRequest<void>('/api/notifications/delete', {
    method: 'POST',
    token,
    body: { ids },
  });
}
