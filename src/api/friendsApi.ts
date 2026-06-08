import { apiRequest } from './client';
import type { FriendProfile, FriendRequest, FriendSummary } from './types';

export function sendFriendRequest(receiverPublicId: number, token: string | null): Promise<FriendRequest> {
  return apiRequest<FriendRequest>('/api/friends/requests', {
    method: 'POST',
    token,
    body: { receiverPublicId },
  });
}

export function listReceivedRequests(token: string | null): Promise<FriendRequest[]> {
  return apiRequest<FriendRequest[]>('/api/friends/requests/received', { token });
}

export function listSentRequests(token: string | null): Promise<FriendRequest[]> {
  return apiRequest<FriendRequest[]>('/api/friends/requests/sent', { token });
}

export function acceptFriendRequest(requestId: number, token: string | null): Promise<FriendRequest> {
  return apiRequest<FriendRequest>(`/api/friends/requests/${requestId}/accept`, { method: 'POST', token });
}

export function denyFriendRequest(requestId: number, token: string | null): Promise<FriendRequest> {
  return apiRequest<FriendRequest>(`/api/friends/requests/${requestId}/deny`, { method: 'POST', token });
}

export function unsendFriendRequest(requestId: number, token: string | null): Promise<void> {
  return apiRequest<void>(`/api/friends/requests/${requestId}`, { method: 'DELETE', token });
}

export function listFriends(token: string | null): Promise<FriendSummary[]> {
  return apiRequest<FriendSummary[]>('/api/friends', { token });
}

export function fetchFriendProfile(friendPublicId: number, token: string | null): Promise<FriendProfile> {
  return apiRequest<FriendProfile>(`/api/friends/${friendPublicId}/profile`, { token });
}
