/**
 * Unit tests for the auth Zustand store.
 */
import { beforeEach, describe, expect, it } from 'vitest';
import { useAuthStore } from '@/shared/stores/authStore';
import type { AuthUser, Tokens } from '@/shared/types/auth.types';

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

const mockTokens: Tokens = {
  accessToken: 'access.token.here',
  refreshToken: 'refresh.token.here',
  tokenType: 'Bearer',
  expiresIn: 3600,
};

describe('authStore', () => {
  beforeEach(() => {
    useAuthStore.getState().clear();
  });

  describe('initial state', () => {
    it('starts with all fields null', () => {
      const { accessToken, refreshToken, user, role } = useAuthStore.getState();
      expect(accessToken).toBeNull();
      expect(refreshToken).toBeNull();
      expect(user).toBeNull();
      expect(role).toBeNull();
    });
  });

  describe('setTokens', () => {
    it('stores access and refresh tokens', () => {
      useAuthStore.getState().setTokens(mockTokens);
      const { accessToken, refreshToken } = useAuthStore.getState();
      expect(accessToken).toBe('access.token.here');
      expect(refreshToken).toBe('refresh.token.here');
    });

    it('does not expose tokenType or expiresIn as state fields', () => {
      useAuthStore.getState().setTokens(mockTokens);
      const state = useAuthStore.getState() as unknown as Record<string, unknown>;
      expect(state['tokenType']).toBeUndefined();
      expect(state['expiresIn']).toBeUndefined();
    });
  });

  describe('setUser', () => {
    it('stores the full user object', () => {
      useAuthStore.getState().setUser(mockUser);
      expect(useAuthStore.getState().user).toEqual(mockUser);
    });

    it('extracts the first role into the role field', () => {
      useAuthStore.getState().setUser(mockUser);
      expect(useAuthStore.getState().role).toBe('ADMIN');
    });

    it('sets role to null when roles array is empty', () => {
      useAuthStore.getState().setUser({ ...mockUser, roles: [] });
      expect(useAuthStore.getState().role).toBeNull();
    });

    it('maps SUPER_ADMIN role correctly', () => {
      useAuthStore.getState().setUser({ ...mockUser, roles: ['SUPER_ADMIN'] });
      expect(useAuthStore.getState().role).toBe('SUPER_ADMIN');
    });

    it('maps STAFF role correctly', () => {
      useAuthStore.getState().setUser({ ...mockUser, roles: ['STAFF'] });
      expect(useAuthStore.getState().role).toBe('STAFF');
    });
  });

  describe('clear', () => {
    it('resets all state to null', () => {
      useAuthStore.getState().setTokens(mockTokens);
      useAuthStore.getState().setUser(mockUser);

      useAuthStore.getState().clear();

      const { accessToken, refreshToken, user, role } = useAuthStore.getState();
      expect(accessToken).toBeNull();
      expect(refreshToken).toBeNull();
      expect(user).toBeNull();
      expect(role).toBeNull();
    });
  });
});
