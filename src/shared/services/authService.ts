import { apiClient } from '@/shared/lib/axios';
import type {
  AccessTokenResponse,
  LegacyLoginResponse,
  LoginRequest,
} from '@/shared/types/auth.types';

type AuthSessionPayload = AccessTokenResponse | LegacyLoginResponse;

function normalizeAuthSession(payload: AuthSessionPayload): AccessTokenResponse {
  if ('accessToken' in payload && typeof payload.accessToken === 'string') {
    return payload;
  }

  if ('tokens' in payload && typeof payload.tokens?.accessToken === 'string') {
    return {
      accessToken: payload.tokens.accessToken,
      tokenType: payload.tokens.tokenType,
      expiresIn: payload.tokens.expiresIn,
      user: payload.user,
    };
  }

  throw new Error('Auth response is missing accessToken');
}

export const authService = {
  login: async (request: LoginRequest) =>
    normalizeAuthSession(
      await apiClient.post<AuthSessionPayload>('/auth/login', request, {
        withCredentials: true,
      }),
    ),

  logout: () =>
    apiClient.post<void>('/auth/logout', undefined, { withCredentials: true }),

  refreshToken: async () =>
    normalizeAuthSession(
      await apiClient.post<AuthSessionPayload>('/auth/refresh-token', undefined, {
        withCredentials: true,
      }),
    ),
};
