# Admin Web Agent Notes

Use `docs/api/api-common.md` and `docs/api/admin-api-contract.md` as the only admin API auth contract source of truth.

## Auth contract

- `POST /api/v1/auth/login` returns the access token in JSON and sets the refresh token as an HttpOnly cookie.
- `POST /api/v1/auth/refresh-token` reads the cookie. Do not send `refreshToken` in the request body.
- `POST /api/v1/auth/logout` clears the refresh cookie server-side. Frontend must send credentials and must not try to delete the HttpOnly cookie in JavaScript.
- Login, refresh, and logout requests must use `withCredentials: true`.
- Protected admin API calls still use `Authorization: Bearer <accessToken>`.

## Storage rules

- Never store `refreshToken` in `localStorage` or `sessionStorage`.
- Never store `accessToken` in `localStorage`.
- Prefer memory-only `accessToken`. Temporary `sessionStorage` fallback is acceptable only if a future refactor truly requires it.
- `localStorage` is only for non-sensitive UI data such as theme, locale, sidebar state, table preferences, and page size.
- Do not persist admin profile data or treat frontend roles/permissions as the source of truth.

## Bootstrap/logout behavior

- On app startup, remove legacy refresh-token keys such as `auth-storage` and `fashion-shop.refresh-token-hint`, then attempt cookie-based refresh.
- On refresh failure, clear in-memory auth state and avoid retry loops.
- On logout, clear local auth state and let the backend clear the cookie.

## Environment

- `VITE_API_BASE_URL` must point at the backend `/api/v1` base URL.
- `VITE_SITE_URL` must match the admin frontend origin expected by backend CORS/cookie config.
