/**
 * Unit tests for the auth Zustand store.
 */
import { beforeEach, describe, expect, it } from 'vitest';
import { useAuthStore } from '@/shared/stores/authStore';
import type { AuthUser, LoginResponse } from '@/shared/types/auth.types';

const mockUser: AuthUser = {
  id: 1,
  email: 'hayzolady@gmail.com',
  firstName: 'Nguyen',
  lastName: 'Van Loc',
  phoneNumber: '0912345678',
  status: 'ACTIVE',
  roles: ['ADMIN'],
  createdAt: '2026-04-18T13:03:28',
};

const mockSession: LoginResponse = {
  accessToken: 'access.token.here',
  tokenType: 'Bearer',
  expiresIn: 3600,
  user: mockUser,
};

function createJwt(payload: Record<string, unknown>): string {
  const header = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `${header}.${body}.signature`;
}

describe('authStore', () => {
  beforeEach(() => {
    useAuthStore.getState().clear();
    useAuthStore.getState().setAuthResolved(false);
    window.localStorage.clear();
    window.sessionStorage.clear();
  });

  describe('initial state', () => {
    it('starts with an unresolved empty session', () => {
      const { accessToken, user, role, isAuthResolved } = useAuthStore.getState();
      expect(accessToken).toBeNull();
      expect(user).toBeNull();
      expect(role).toBeNull();
      expect(isAuthResolved).toBe(false);
    });
  });

  describe('setSession', () => {
    it('stores the access token and user from the auth response', () => {
      useAuthStore.getState().setSession(mockSession);

      const { accessToken, user, role } = useAuthStore.getState();
      expect(accessToken).toBe('access.token.here');
      expect(user).toEqual(mockUser);
      expect(role).toBe('ADMIN');
    });

    it('derives minimal user state from the access token when user is absent', () => {
      const accessToken = createJwt({
        sub: 'staff@example.com',
        roles: ['STAFF'],
        userId: '42',
      });

      useAuthStore.getState().setSession({ accessToken });

      const { user, role } = useAuthStore.getState();
      expect(user).toMatchObject({
        id: '42',
        email: 'staff@example.com',
        roles: ['STAFF'],
      });
      expect(role).toBe('STAFF');
    });

    it('does not expose tokenType or expiresIn as state fields', () => {
      useAuthStore.getState().setSession(mockSession);
      const state = useAuthStore.getState() as unknown as Record<string, unknown>;
      expect(state['tokenType']).toBeUndefined();
      expect(state['expiresIn']).toBeUndefined();
    });

    it('does not persist auth state to browser storage', () => {
      useAuthStore.getState().setSession(mockSession);
      expect(window.localStorage.getItem('auth-storage')).toBeNull();
      expect(window.sessionStorage.getItem('auth-storage')).toBeNull();
    });
  });

  describe('setAuthResolved', () => {
    it('marks bootstrap completion explicitly', () => {
      useAuthStore.getState().setAuthResolved(true);
      expect(useAuthStore.getState().isAuthResolved).toBe(true);
    });
  });

  describe('clear', () => {
    it('resets the in-memory session only', () => {
      useAuthStore.getState().setSession(mockSession);
      useAuthStore.getState().setAuthResolved(true);

      useAuthStore.getState().clear();

      const { accessToken, user, role, isAuthResolved } = useAuthStore.getState();
      expect(accessToken).toBeNull();
      expect(user).toBeNull();
      expect(role).toBeNull();
      expect(isAuthResolved).toBe(true);
    });
  });
});
