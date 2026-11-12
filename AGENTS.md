# Admin Web Agent Notes

## Shared workflow and quality gate

Follow `../GIT_CONVENTIONS.md` for new Git work. Before coding, read the GitHub Issue and acceptance criteria, then run `git status --short --branch` and preserve unrelated WIP. Do not run `git reset --hard`, `git clean`, rebase, force-push, commit, push, merge, or change Git author identity unless explicitly requested. Do not access production resources, log secrets, or conceal failed checks.

Keep the existing feature-based structure and the flow `page/component -> custom hook -> service -> shared Axios client`. Components render and handle UI events; services are typed async API functions and do not depend on React or stores. Keep server state in TanStack Query, form state in React Hook Form plus Zod, URL-owned filters in search params, and small client/UI state in the established Zustand stores. Do not invent or silently change API contracts.

For every changed async screen or mutation, cover loading, error, empty where applicable, and success/pending states; map server validation errors to the form and invalidate/refetch affected queries after successful mutations. Maintain strict TypeScript and avoid `any`.

Before proposing completion, run the applicable commands: `npm run lint`, `npm run typecheck`, `npm run test` for behavior covered by the Vitest suite, and `npm run build`. Report failures or skipped checks with their reason.

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
- On logout, call the cookie-based backend endpoint with credentials, then clear local auth state and let the backend clear the cookie.
- If logout fails, still clear local auth state and redirect to login.

## Environment

- `VITE_API_BASE_URL` must point at the backend `/api/v1` base URL.
- `VITE_SITE_URL` must match the admin frontend origin expected by backend CORS/cookie config.
