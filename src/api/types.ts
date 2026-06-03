export type UserRole = 'USER' | 'SUPERADMIN';
export type DifficultyLevel = 'NONE' | 'EASY' | 'MEDIUM' | 'HARD';
export type ScheduledInterval = 'HOURS_2' | 'DAYS_1' | 'DAYS_2' | 'DAYS_3' | 'DAYS_5' | 'DAYS_7' | 'DAYS_9';

export type RegisterBody = {
  name: string;
  email: string;
  password: string;
};

export type LoginBody = {
  email: string;
  password: string;
};

export type GoogleLoginBody = {
  idToken: string;
};

export type AuthConfig = {
  googleAuthEnabled: boolean;
  googleWebClientId: string | null;
};

export type AuthResponse = {
  token: string;
  expiresAt: string;
};

export type MeResponse = {
  publicId: number;
  name: string;
  email: string;
  role: UserRole;
};

export type UpdateProfileBody = {
  name?: string;
  currentPassword?: string;
  newPassword?: string;
};

export type ApiErrorBody = {
  message?: string;
  detail?: string;
  title?: string;
  error?: string;
};

export type Deck = {
  id: number;
  name: string;
  position: number;
  subject: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  cardCount?: number;
  scheduledCardCount?: number;
  waitingCardCount?: number;
  readyRevisionCount?: number;
  ownerName?: string | null;
  alreadyCloned?: boolean;
  clonedDeckId?: number | null;
};

export type Card = {
  id: number;
  deckId: number;
  question: string;
  answer: string;
  difficultyLevel: DifficultyLevel;
  dueAt: string | null;
  rightStreak: number;
  wrongStreak: number;
  scheduledInterval: ScheduledInterval | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateDeckBody = {
  name: string;
  subject: string;
  isPublic?: boolean;
  position?: number;
};

export type CreateCardBody = {
  question: string;
  answer: string;
};

export type UpdateDeckBody = Partial<CreateDeckBody>;
export type UpdateCardBody = Partial<CreateCardBody>;

export type DeckSearchBody = {
  name?: string;
  subject?: string;
  isPublic?: boolean;
  ownerId?: number;
  page?: number;
  size?: number;
};

export type CardSearchBody = {
  question?: string;
  difficultyLevel?: DifficultyLevel;
  dueOnly?: boolean;
  scheduledOnly?: boolean;
  waitingOnly?: boolean;
  readyScheduledOnly?: boolean;
  page?: number;
  size?: number;
};

export type RevisionDeckSummary = {
  id: number;
  name: string;
  subject: string;
  scheduledCardCount: number;
  waitingCardCount: number;
  readyRevisionCount: number;
  cards: Card[];
};

export type RevisionsResponse = {
  decks: RevisionDeckSummary[];
};

export type AdminCardSearchBody = CardSearchBody & {
  ownerId?: number;
  deckId?: number;
};

export type AnswerCardBody = {
  correct: boolean;
};

export type DashboardResponse = {
  totalSubjects: number;
  totalCards: number;
  dueCards: number;
  answeredToday: number;
};

export type DashboardPieSlice = {
  key: string;
  label: string;
  value: number;
};

export type DashboardSubjectStack = {
  subject: string;
  totalCards: number;
  dueCards: number;
  scheduledCards: number;
  unscheduledCards: number;
};

export type DashboardChartsResponse = {
  pie: DashboardPieSlice[];
  stackedBySubject: DashboardSubjectStack[];
};

export type FriendRequestStatus = 'PENDING' | 'ACCEPTED' | 'DENIED' | 'CANCELLED';

export type FriendRequest = {
  id: number;
  requesterPublicId: number;
  requesterEmail: string;
  receiverPublicId: number;
  receiverEmail: string;
  status: FriendRequestStatus;
  createdAt: string;
  updatedAt: string;
};

export type FriendSummary = {
  publicId: number;
  name: string;
  email: string;
  friendsSince: string;
};

export type FriendProfile = {
  publicId: number;
  name: string;
  email: string;
  totalSubjects: number;
  totalCards: number;
  dueCards: number;
  subjects: Deck[];
};

export type StudyCalendarResponse = {
  days: string[];
};

export type UserSummary = {
  id: number;
  publicId: number;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
};

export type AdminCreateSubjectBody = {
  ownerId: number;
  name: string;
  subject: string;
  isPublic?: boolean;
  position?: number;
};

export type AdminCreateCardBody = {
  deckId: number;
  question: string;
  answer: string;
};

export type PagedResponse<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
  first: boolean;
  last: boolean;
};

export type NotificationType =
  | 'REVIEW_EXPIRED'
  | 'FRIEND_REQUEST_RECEIVED'
  | 'FRIEND_REQUEST_ACCEPTED';

export type Notification = {
  id: number;
  type: NotificationType;
  title: string;
  message: string;
  readAt: string | null;
  read: boolean;
  createdAt: string;
};

export type NotificationSummary = {
  unreadCount: number;
};
