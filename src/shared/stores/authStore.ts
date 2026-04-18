import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthUser, Role, Tokens } from '../types/auth.types';

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: AuthUser | null;
  role: Role | null;
  setTokens: (tokens: Tokens) => void;
  setUser: (user: AuthUser) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      role: null,
      setTokens: (tokens) =>
        set({ accessToken: tokens.accessToken, refreshToken: tokens.refreshToken }),
      setUser: (user) => set({ user, role: user.roles[0] ?? null }),
      clear: () =>
        set({ accessToken: null, refreshToken: null, user: null, role: null }),
    }),
    { name: 'auth-storage' },
  ),
);
