import { apiRequest } from './client';
import type {
  AnswerCardBody,
  Card,
  CardSearchBody,
  CreateCardBody,
  CreateDeckBody,
  Deck,
  DeckSearchBody,
  PagedResponse,
  UpdateCardBody,
  UpdateDeckBody,
} from './types';

export async function fetchDecks(token: string | null): Promise<Deck[]> {
  const response = await apiRequest<PagedResponse<Deck>>('/api/decks/search', {
    method: 'POST',
    token,
    body: { page: 0, size: 100 } as DeckSearchBody,
  });
  return response.content;
}

export async function fetchDeckCards(deckId: number, token: string | null): Promise<Card[]> {
  const response = await apiRequest<PagedResponse<Card>>(`/api/decks/${deckId}/cards/search`, {
    method: 'POST',
    token,
    body: { page: 0, size: 100 } as CardSearchBody,
  });
  return response.content;
}

export async function fetchDueDeckCards(deckId: number, token: string | null): Promise<Card[]> {
  const response = await apiRequest<PagedResponse<Card>>(`/api/decks/${deckId}/cards/search`, {
    method: 'POST',
    token,
    body: { page: 0, size: 100, dueOnly: true } as CardSearchBody,
  });
  return response.content;
}

export async function fetchRevisionDeckCards(deckId: number, token: string | null): Promise<Card[]> {
  const response = await apiRequest<PagedResponse<Card>>(`/api/decks/${deckId}/cards/search`, {
    method: 'POST',
    token,
    body: { page: 0, size: 100, readyScheduledOnly: true } as CardSearchBody,
  });
  return response.content;
}

export async function createDeck(body: CreateDeckBody, token: string | null): Promise<Deck> {
  return apiRequest<Deck>('/api/decks', { method: 'POST', body, token });
}

export async function createCard(
  deckId: number,
  body: CreateCardBody,
  token: string | null
): Promise<Card> {
  return apiRequest<Card>(`/api/decks/${deckId}/cards`, { method: 'POST', body, token });
}

export async function updateDeck(deckId: number, body: UpdateDeckBody, token: string | null): Promise<Deck> {
  return apiRequest<Deck>(`/api/decks/${deckId}`, { method: 'PUT', body, token });
}

export async function deleteDeck(deckId: number, token: string | null): Promise<void> {
  return apiRequest<void>(`/api/decks/${deckId}`, { method: 'DELETE', token });
}

export async function updateCard(
  deckId: number,
  cardId: number,
  body: UpdateCardBody,
  token: string | null
): Promise<Card> {
  return apiRequest<Card>(`/api/decks/${deckId}/cards/${cardId}`, { method: 'PUT', body, token });
}

export async function deleteCard(deckId: number, cardId: number, token: string | null): Promise<void> {
  return apiRequest<void>(`/api/decks/${deckId}/cards/${cardId}`, { method: 'DELETE', token });
}

export async function answerCard(
  deckId: number,
  cardId: number,
  body: AnswerCardBody,
  token: string | null
): Promise<Card> {
  return apiRequest<Card>(`/api/decks/${deckId}/cards/${cardId}/answer`, { method: 'POST', body, token });
}

export async function skipCard(deckId: number, cardId: number, token: string | null): Promise<Card> {
  return apiRequest<Card>(`/api/decks/${deckId}/cards/${cardId}/skip`, { method: 'POST', token });
}
