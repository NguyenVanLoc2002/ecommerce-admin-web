// Auth-feature-specific types.
// AuthUser, Role, and auth response types live in shared/types/auth.types.ts
// because they are also consumed by the axios interceptor and authStore.
// Re-export them here so the feature can be referenced self-consistently.

export type {
  AuthUser,
  Role,
  AccessTokenResponse,
  LoginRequest,
  LoginResponse,
  RefreshTokenResponse,
} from '@/shared/types/auth.types';
