/**
 * Integration tests for POST /auth/login and related auth endpoints.
 * These tests call the real backend at localhost:8080 — the server must be running.
 */

const BASE = 'http://localhost:8080/api/v1';

async function post(path: string, body: unknown) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return { status: res.status, body: await res.json() };
}

// ---------------------------------------------------------------------------
// POST /auth/login
// ---------------------------------------------------------------------------

describe('POST /auth/login', () => {
  describe('success', () => {
    it('returns 200 with user + tokens on valid credentials', async () => {
      const { status, body } = await post('/auth/login', {
        email: 'hayzolady@gmail.com',
        password: 'Ln123456',
      });

      expect(status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.code).toBe('SUCCESS');

      // Top-level shape
      expect(body.data).toHaveProperty('user');
      expect(body.data).toHaveProperty('tokens');

      // User shape
      const { user } = body.data;
      expect(user.email).toBe('hayzolady@gmail.com');
      expect(typeof user.id).toBe('number');
      expect(typeof user.firstName).toBe('string');
      expect(typeof user.lastName).toBe('string');
      expect(Array.isArray(user.roles)).toBe(true);
      expect(user.roles.length).toBeGreaterThan(0);
      expect(['STAFF', 'ADMIN', 'SUPER_ADMIN']).toContain(user.roles[0]);

      // Token shape
      const { tokens } = body.data;
      expect(typeof tokens.accessToken).toBe('string');
      expect(tokens.accessToken.length).toBeGreaterThan(0);
      expect(typeof tokens.refreshToken).toBe('string');
      expect(tokens.refreshToken.length).toBeGreaterThan(0);
      expect(tokens.tokenType).toBe('Bearer');
      expect(typeof tokens.expiresIn).toBe('number');
    });
  });

  describe('invalid credentials', () => {
    it('returns 401 INVALID_CREDENTIALS on wrong password', async () => {
      const { status, body } = await post('/auth/login', {
        email: 'hayzolady@gmail.com',
        password: 'wrongpassword',
      });

      expect(status).toBe(401);
      expect(body.success).toBe(false);
      expect(body.code).toBe('INVALID_CREDENTIALS');
    });

    it('returns 401 INVALID_CREDENTIALS on unknown email', async () => {
      const { status, body } = await post('/auth/login', {
        email: 'nobody@nowhere.com',
        password: 'Ln123456',
      });

      expect(status).toBe(401);
      expect(body.success).toBe(false);
      expect(body.code).toBe('INVALID_CREDENTIALS');
    });
  });

  describe('validation errors', () => {
    it('returns 422 VALIDATION_ERROR with field errors on empty body', async () => {
      const { status, body } = await post('/auth/login', {});

      expect(status).toBe(422);
      expect(body.success).toBe(false);
      expect(body.code).toBe('VALIDATION_ERROR');
      expect(Array.isArray(body.errors)).toBe(true);
      const fields = (body.errors as Array<{ field: string }>).map((e) => e.field);
      expect(fields).toContain('email');
      expect(fields).toContain('password');
    });

    it('returns 422 with email field error on invalid email format', async () => {
      const { status, body } = await post('/auth/login', {
        email: 'notanemail',
        password: 'Ln123456',
      });

      expect(status).toBe(422);
      expect(body.code).toBe('VALIDATION_ERROR');
      const fields = (body.errors as Array<{ field: string }>).map((e) => e.field);
      expect(fields).toContain('email');
    });

    it('returns 422 with password field error on missing password', async () => {
      const { status, body } = await post('/auth/login', {
        email: 'hayzolady@gmail.com',
      });

      expect(status).toBe(422);
      expect(body.code).toBe('VALIDATION_ERROR');
      const fields = (body.errors as Array<{ field: string }>).map((e) => e.field);
      expect(fields).toContain('password');
      expect(fields).not.toContain('email');
    });
  });
});

// ---------------------------------------------------------------------------
// POST /auth/refresh-token
// ---------------------------------------------------------------------------

describe('POST /auth/refresh-token', () => {
  let validRefreshToken: string;

  beforeAll(async () => {
    const { body } = await post('/auth/login', {
      email: 'hayzolady@gmail.com',
      password: 'Ln123456',
    });
    validRefreshToken = body.data.tokens.refreshToken as string;
  });

  it('returns 200 with new tokens on valid refresh token', async () => {
    const { status, body } = await post('/auth/refresh-token', {
      refreshToken: validRefreshToken,
    });

    expect(status).toBe(200);
    expect(body.success).toBe(true);
    expect(typeof body.data.accessToken).toBe('string');
    expect(typeof body.data.refreshToken).toBe('string');
    // accessToken is always a fresh JWT; refreshToken may or may not rotate depending on backend policy
    expect(body.data.accessToken.split('.').length).toBe(3); // valid JWT structure
  });

  it('returns error on invalid refresh token', async () => {
    const { status, body } = await post('/auth/refresh-token', {
      refreshToken: 'invalid.token.value',
    });

    expect(status).not.toBe(200);
    expect(body.success).toBe(false);
  });

  it('returns 422 VALIDATION_ERROR when refreshToken field is missing', async () => {
    const { status, body } = await post('/auth/refresh-token', {});

    expect(status).toBe(422);
    expect(body.code).toBe('VALIDATION_ERROR');
    const fields = (body.errors as Array<{ field: string }>).map((e) => e.field);
    expect(fields).toContain('refreshToken');
  });
});
