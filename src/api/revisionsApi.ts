import { apiRequest } from './client';
import type { RevisionsResponse } from './types';

export function fetchRevisions(token: string | null): Promise<RevisionsResponse> {
  return apiRequest<RevisionsResponse>('/api/revisions', { token });
}
