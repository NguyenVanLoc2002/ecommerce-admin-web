import { beforeEach, describe, expect, it, vi } from 'vitest';
import { authService } from '../services/authService';

const { postMock } = vi.hoisted(() => ({
  postMock: vi.fn(),
}));

vi.mock('@/shared/lib/axios', () => ({
  apiClient: {
    post: postMock,
  },
}));

describe('authService', () => {
  beforeEach(() => {
    postMock.mockReset();
  });

  it('logs in with credentials so the backend can set the HttpOnly refresh cookie', async () => {
    postMock.mockResolvedValue({
      accessToken: 'access-token',
      tokenType: 'Bearer',
      expiresIn: 3600,
      user: { roles: ['ADMIN'] },
    });

    await authService.login({
      email: 'admin@example.com',
      password: 'Password123',
    });

    expect(postMock).toHaveBeenCalledWith(
      '/auth/login',
      {
        email: 'admin@example.com',
        password: 'Password123',
      },
      { withCredentials: true },
    );
  });

  it('refreshes from the HttpOnly cookie without sending a refresh token body', async () => {
    postMock.mockResolvedValue({
      accessToken: 'access-token',
      tokenType: 'Bearer',
      expiresIn: 3600,
      user: { roles: ['ADMIN'] },
    });

    await authService.refreshToken();

    expect(postMock).toHaveBeenCalledWith(
      '/auth/refresh-token',
      undefined,
      { withCredentials: true },
    );
  });

  it('logs out with credentials and no refresh token request body', async () => {
    postMock.mockResolvedValue(undefined);

    await authService.logout();

    expect(postMock).toHaveBeenCalledWith(
      '/auth/logout',
      undefined,
      { withCredentials: true },
    );
  });
});
