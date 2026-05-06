import { create } from 'zustand';
import { deriveAuthUserFromAccessToken, selectPrimaryRole } from '../lib/jwt';
import type { AccessTokenResponse, AuthUser, Role } from '../types/auth.types';

interface AuthState {
  accessToken: string | null;
  user: AuthUser | null;
  role: Role | null;
  isAuthResolved: boolean;
  setSession: (session: AccessTokenResponse) => void;
  setAuthResolved: (isResolved: boolean) => void;
  clear: () => void;
}

function mergeSessionUser(accessToken: string, user?: AuthUser | null): AuthUser | null {
  const derivedUser = deriveAuthUserFromAccessToken(accessToken);

  if (!user && !derivedUser) {
    return null;
  }

  if (!user) {
    return derivedUser;
  }

  return {
    ...derivedUser,
    ...user,
    roles: user.roles.length > 0 ? user.roles : (derivedUser?.roles ?? []),
  };
}

export const useAuthStore = create<AuthState>()((set) => ({
  accessToken: null,
  user: null,
  role: null,
  isAuthResolved: false,
  setSession: ({ accessToken, user }) => {
    const resolvedUser = mergeSessionUser(accessToken, user);

    set({
      accessToken,
      user: resolvedUser,
      role: selectPrimaryRole(resolvedUser?.roles ?? []),
    });
  },
  setAuthResolved: (isAuthResolved) => set({ isAuthResolved }),
  clear: () =>
    set({
      accessToken: null,
      user: null,
      role: null,
    }),
}));
