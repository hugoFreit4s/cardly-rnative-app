import { apiRequest } from './client';
import type {
  AdminCardSearchBody,
  AdminCreateCardBody,
  AdminCreateSubjectBody,
  Card,
  Deck,
  DeckSearchBody,
  PagedResponse,
  UpdateCardBody,
  UpdateDeckBody,
  UserSummary,
} from './types';

export async function searchUsers(token: string | null): Promise<UserSummary[]> {
  const response = await apiRequest<PagedResponse<UserSummary>>('/api/admin/users/search', {
    method: 'POST',
    token,
    body: { page: 0, size: 100 },
  });
  return response.content;
}

export function deleteUser(userId: number, token: string | null): Promise<void> {
  return apiRequest<void>(`/api/admin/users/${userId}`, { method: 'DELETE', token });
}

export async function searchSubjects(token: string | null, filters: DeckSearchBody = {}): Promise<Deck[]> {
  const response = await apiRequest<PagedResponse<Deck>>('/api/admin/subjects/search', {
    method: 'POST',
    token,
    body: { page: 0, size: 200, ...filters },
  });
  return response.content;
}

export function createSubject(body: AdminCreateSubjectBody, token: string | null): Promise<Deck> {
  return apiRequest<Deck>('/api/admin/subjects', { method: 'POST', body, token });
}

export function updateSubject(deckId: number, body: UpdateDeckBody, token: string | null): Promise<Deck> {
  return apiRequest<Deck>(`/api/admin/subjects/${deckId}`, { method: 'PUT', body, token });
}

export function deleteSubject(deckId: number, token: string | null): Promise<void> {
  return apiRequest<void>(`/api/admin/subjects/${deckId}`, { method: 'DELETE', token });
}

export async function searchCards(token: string | null, filters: AdminCardSearchBody = {}): Promise<Card[]> {
  const response = await apiRequest<PagedResponse<Card>>('/api/admin/cards/search', {
    method: 'POST',
    token,
    body: { page: 0, size: 300, ...filters },
  });
  return response.content;
}

export function createCardByAdmin(body: AdminCreateCardBody, token: string | null): Promise<Card> {
  return apiRequest<Card>('/api/admin/cards', { method: 'POST', body, token });
}

export function updateCardByAdmin(cardId: number, body: UpdateCardBody, token: string | null): Promise<Card> {
  return apiRequest<Card>(`/api/admin/cards/${cardId}`, { method: 'PUT', body, token });
}

export function deleteCardByAdmin(cardId: number, token: string | null): Promise<void> {
  return apiRequest<void>(`/api/admin/cards/${cardId}`, { method: 'DELETE', token });
}
