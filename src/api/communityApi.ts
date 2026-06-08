import { apiRequest } from './client';
import type { Deck, PagedResponse } from './types';

export async function searchCommunitySubjects(token: string | null): Promise<Deck[]> {
  const response = await apiRequest<PagedResponse<Deck>>('/api/community/subjects/search', {
    method: 'POST',
    token,
    body: { page: 0, size: 100 },
  });
  return response.content;
}

export function cloneCommunitySubject(deckId: number, token: string | null): Promise<Deck> {
  return apiRequest<Deck>(`/api/community/subjects/${deckId}/clone`, { method: 'POST', token });
}
