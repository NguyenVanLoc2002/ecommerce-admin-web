export const Role = {
  STAFF: 'STAFF',
  ADMIN: 'ADMIN',
  SUPER_ADMIN: 'SUPER_ADMIN',
} as const;
export type Role = (typeof Role)[keyof typeof Role];

export interface AuthUser {
  id?: string | number | null;
  email?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  status?: string;
  roles: string[];
  createdAt?: string;
}

export interface AccessTokenResponse {
  accessToken: string;
  tokenType?: string;
  expiresIn?: number;
  user?: AuthUser | null;
}

export interface LegacyLoginResponse {
  user: AuthUser;
  tokens: {
    accessToken: string;
    tokenType?: string;
    expiresIn?: number;
  };
}

export interface LoginRequest {
  email: string;
  password: string;
}

export type LoginResponse = AccessTokenResponse;

export type RefreshTokenResponse = AccessTokenResponse;
