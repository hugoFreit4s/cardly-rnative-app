import { apiRequest } from './client';
import type {
  AuthConfig,
  AuthResponse,
  GoogleLoginBody,
  LoginBody,
  MeResponse,
  RegisterBody,
  UpdateProfileBody,
} from './types';

export function fetchAuthConfig(): Promise<AuthConfig> {
  return apiRequest<AuthConfig>('/api/auth/config');
}

export function login(body: LoginBody): Promise<AuthResponse> {
  return apiRequest<AuthResponse>('/api/auth/login', { method: 'POST', body });
}

export function register(body: RegisterBody): Promise<AuthResponse> {
  return apiRequest<AuthResponse>('/api/auth/register', { method: 'POST', body });
}

export function googleLogin(body: GoogleLoginBody): Promise<AuthResponse> {
  return apiRequest<AuthResponse>('/api/auth/google', { method: 'POST', body });
}

export function getMe(token: string): Promise<MeResponse> {
  return apiRequest<MeResponse>('/api/me', { token });
}

export function updateProfile(body: UpdateProfileBody, token: string): Promise<MeResponse> {
  return apiRequest<MeResponse>('/api/me', { method: 'PATCH', body, token });
}

export function deleteAccount(token: string): Promise<void> {
  return apiRequest<void>('/api/me', { method: 'DELETE', token });
}

export function logoutRemote(): Promise<void> {
  return apiRequest<void>('/api/auth/logout', { method: 'POST' });
}
