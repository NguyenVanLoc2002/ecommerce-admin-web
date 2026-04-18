// Auth-feature-specific types.
// AuthUser, Role, Tokens, LoginRequest, LoginResponse live in shared/types/auth.types.ts
// because they are also consumed by the axios interceptor and authStore.
// Re-export them here so the feature can be referenced self-consistently.

export type {
  AuthUser,
  Role,
  Tokens,
  LoginRequest,
  LoginResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
} from '@/shared/types/auth.types';
