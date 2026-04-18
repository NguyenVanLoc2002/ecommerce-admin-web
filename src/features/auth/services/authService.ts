import { apiClient } from '@/shared/lib/axios';
import type {
  LoginRequest,
  LoginResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
} from '@/shared/types/auth.types';

export const authService = {
  login: (request: LoginRequest) =>
    apiClient.post<LoginResponse>('/auth/login', request),

  logout: () =>
    apiClient.post<void>('/auth/logout'),

  refreshToken: (request: RefreshTokenRequest) =>
    apiClient.post<RefreshTokenResponse>('/auth/refresh-token', request),
};
