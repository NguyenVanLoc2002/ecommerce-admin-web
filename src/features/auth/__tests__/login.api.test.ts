/**
 * Integration tests for POST /auth/login and related auth endpoints.
 * These tests call the real backend at localhost:8080 - the server must be running.
 */

import { describe, expect, it } from 'vitest';
import type { ApiError, ApiResponse } from '@/shared/types/api.types';

const BASE = 'http://localhost:8080/api/v1';

type TokenResponseBody = {
  accessToken?: string;
  tokenType?: string;
  expiresIn?: number;
  refreshToken?: string;
};

type LoginResponseBody = {
  user: {
    roles: string[];
  };
  tokens: TokenResponseBody;
};

async function post(
  path: string,
  body?: unknown,
  headers: Record<string, string> = {},
): Promise<{
  status: number;
  body: ApiResponse<unknown> | ApiError;
  cookie: string | null;
}> {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  return {
    status: res.status,
    body: (await res.json()) as ApiResponse<unknown> | ApiError,
    cookie: res.headers.get('set-cookie'),
  };
}

async function loginAndGetRefreshCookie(): Promise<string> {
  const { status, cookie } = await post('/auth/login', {
    email: 'hayzolady@gmail.com',
    password: 'Ln123456',
  });

  expect(status).toBe(200);

  const refreshCookie = cookie?.split(';')[0];
  expect(refreshCookie).toBeTruthy();

  if (!refreshCookie) {
    throw new Error('Login response did not set a refresh-token cookie');
  }

  return refreshCookie;
}

describe('POST /auth/login', () => {
  describe('success', () => {
    it('returns 200 with nested access-token metadata and no refresh token in JSON', async () => {
      const { status, body } = await post('/auth/login', {
        email: 'hayzolady@gmail.com',
        password: 'Ln123456',
      });
      const successBody = body as ApiResponse<LoginResponseBody>;

      expect(status).toBe(200);
      expect(successBody.success).toBe(true);
      expect(successBody.code).toBe('SUCCESS');
      expect(typeof successBody.data.tokens.accessToken).toBe('string');
      expect(successBody.data.tokens.accessToken?.length).toBeGreaterThan(0);
      expect(successBody.data.tokens.tokenType).toBe('Bearer');
      expect(typeof successBody.data.tokens.expiresIn).toBe('number');
      expect(successBody.data.tokens.refreshToken).toBeUndefined();
    });
  });

  describe('invalid credentials', () => {
    it('returns 401 INVALID_CREDENTIALS on wrong password', async () => {
      const { status, body } = await post('/auth/login', {
        email: 'hayzolady@gmail.com',
        password: 'wrongpassword',
      });
      const errorBody = body as ApiError;

      expect(status).toBe(401);
      expect(errorBody.success).toBe(false);
      expect(errorBody.code).toBe('INVALID_CREDENTIALS');
    });

    it('returns 401 INVALID_CREDENTIALS on unknown email', async () => {
      const { status, body } = await post('/auth/login', {
        email: 'nobody@nowhere.com',
        password: 'Ln123456',
      });
      const errorBody = body as ApiError;

      expect(status).toBe(401);
      expect(errorBody.success).toBe(false);
      expect(errorBody.code).toBe('INVALID_CREDENTIALS');
    });
  });

  describe('validation errors', () => {
    it('returns 422 VALIDATION_ERROR with field errors on empty body', async () => {
      const { status, body } = await post('/auth/login', {});
      const errorBody = body as ApiError;

      expect(status).toBe(422);
      expect(errorBody.success).toBe(false);
      expect(errorBody.code).toBe('VALIDATION_ERROR');
      expect(Array.isArray(errorBody.errors)).toBe(true);
      const fields = (errorBody.errors ?? []).map((error) => error.field);
      expect(fields).toContain('email');
      expect(fields).toContain('password');
    });

    it('returns 422 with email field error on invalid email format', async () => {
      const { status, body } = await post('/auth/login', {
        email: 'notanemail',
        password: 'Ln123456',
      });
      const errorBody = body as ApiError;

      expect(status).toBe(422);
      expect(errorBody.code).toBe('VALIDATION_ERROR');
      const fields = (errorBody.errors ?? []).map((error) => error.field);
      expect(fields).toContain('email');
    });

    it('returns 422 with password field error on missing password', async () => {
      const { status, body } = await post('/auth/login', {
        email: 'hayzolady@gmail.com',
      });
      const errorBody = body as ApiError;

      expect(status).toBe(422);
      expect(errorBody.code).toBe('VALIDATION_ERROR');
      const fields = (errorBody.errors ?? []).map((error) => error.field);
      expect(fields).toContain('password');
      expect(fields).not.toContain('email');
    });
  });
});

describe('POST /auth/refresh-token', () => {
  it('returns 200 with a fresh access token when the refresh cookie is present', async () => {
    const refreshCookie = await loginAndGetRefreshCookie();

    const { status, body } = await post(
      '/auth/refresh-token',
      undefined,
      { Cookie: refreshCookie },
    );
    const successBody = body as ApiResponse<TokenResponseBody>;

    expect(status).toBe(200);
    expect(successBody.success).toBe(true);
    expect(typeof successBody.data.accessToken).toBe('string');
    expect(successBody.data.refreshToken).toBeUndefined();
    expect(successBody.data.accessToken?.split('.').length).toBe(3);
  });

  it('returns error when the refresh cookie is missing or invalid', async () => {
    const { status, body } = await post(
      '/auth/refresh-token',
      undefined,
      { Cookie: 'refreshToken=invalid.token.value' },
    );
    const errorBody = body as ApiError;

    expect(status).not.toBe(200);
    expect(errorBody.success).toBe(false);
  });

  it('does not require a JSON refreshToken body', async () => {
    const refreshCookie = await loginAndGetRefreshCookie();

    const { status } = await post(
      '/auth/refresh-token',
      undefined,
      { Cookie: refreshCookie },
    );

    expect(status).toBe(200);
  });
});
