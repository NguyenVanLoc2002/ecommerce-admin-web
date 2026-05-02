import axios, {
  type AxiosError,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from 'axios';
import { AppError, type ApiError, type ApiResponse } from '../types/api.types';
import { useAuthStore } from '../stores/authStore';
import { toast } from '../stores/uiStore';

// Augment axios config to carry retry bookkeeping flags
declare module 'axios' {
  interface InternalAxiosRequestConfig {
    _retry?: boolean;
    _retryCount?: number;
  }
}

// Separate instance used exclusively for token-refresh calls.
// Must NOT share interceptors with apiClient to prevent infinite 401 loops.
const _refreshInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15_000,
});

// ─── Refresh-queue management ────────────────────────────────────────────────
// When a refresh is already in-flight, all subsequent 401-ed requests wait
// here and are replayed once the new token arrives.

let isRefreshing = false;

type QueueEntry = {
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
};

let refreshQueue: QueueEntry[] = [];

function drainQueue(token: string | null, error: unknown = null) {
  refreshQueue.forEach(({ resolve, reject }) => {
    if (token !== null) resolve(token);
    else reject(error);
  });
  refreshQueue = [];
}

// ─── Core axios instance ─────────────────────────────────────────────────────

const _instance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15_000,
});

// Request interceptor: attach Bearer token from auth store
_instance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor
_instance.interceptors.response.use(
  (response) => {
    if (
      response.status === 204 ||
      response.status === 205 ||
      response.data === '' ||
      response.data == null
    ) {
      return undefined as unknown as typeof response;
    }

    // Unwrap ApiResponse<T> → return inner data T directly.
    // Services type their calls as apiClient.get<T>(...) and receive T, not AxiosResponse<T>.
    // The cast below is an intentional type boundary: body.data is unknown, cast to the
    // interceptor's expected return type so downstream TypedAxiosClient types work correctly.
    const body = response.data as ApiResponse<unknown> | null;
    if (body !== null && typeof body === 'object' && 'success' in body && 'data' in body) {
      return body.data as typeof response;
    }
    return response;
  },

  async (error: AxiosError) => {
    const config = error.config;

    // ── Network error on GET → retry up to 2 times with 1 s delay ──────────
    if (!error.response && config?.method?.toUpperCase() === 'GET') {
      config._retryCount = (config._retryCount ?? 0) + 1;
      if (config._retryCount <= 2) {
        await new Promise<void>((r) => setTimeout(r, 1_000));
        return _instance(config);
      }
    }

    // ── 401 → attempt token refresh ────────────────────────────────────────
    // Only enter the refresh flow if the store holds a refresh token. Without
    // one the user has no active session, so a 401 is a genuine auth failure
    // (e.g. wrong login credentials) and must be forwarded as an AppError.
    const storedRefreshToken = useAuthStore.getState().refreshToken;
    if (error.response?.status === 401 && config && !config._retry && storedRefreshToken) {
      if (isRefreshing) {
        // Another refresh is in-flight; queue this request until it resolves
        return new Promise((resolve, reject) => {
          refreshQueue.push({
            resolve: (newToken) => {
              config.headers.Authorization = `Bearer ${newToken}`;
              resolve(_instance(config));
            },
            reject,
          });
        });
      }

      config._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = storedRefreshToken;

        const { data } = await _refreshInstance.post<
          ApiResponse<{ accessToken: string; refreshToken: string }>
        >('/auth/refresh-token', { refreshToken });

        const { accessToken, refreshToken: newRefreshToken } = data.data;

        useAuthStore.getState().setTokens({
          accessToken,
          refreshToken: newRefreshToken,
        });

        drainQueue(accessToken);

        config.headers.Authorization = `Bearer ${accessToken}`;
        return _instance(config);
      } catch (refreshError) {
        drainQueue(null, refreshError);
        useAuthStore.getState().clear();
        toast.warning('Session expired. Please sign in again.');

        const redirectPath = encodeURIComponent(
          window.location.pathname + window.location.search,
        );
        // Use replace so the login page doesn't add to browser history
        window.location.replace(`/login?redirect=${redirectPath}`);

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // ── All other errors → normalize to AppError ───────────────────────────
    if (error.response?.data) {
      const apiError = error.response.data as ApiError;
      throw new AppError(apiError);
    }

    throw error;
  },
);

// ─── Typed public client ─────────────────────────────────────────────────────
// The interceptor unwraps ApiResponse<T> → T, so callers receive T directly.
// We override axios's AxiosResponse generics here so TypeScript reflects reality.

type TypedAxiosClient = {
  get<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T>;
  post<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T>;
  patch<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T>;
  put<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T>;
  delete<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T>;
};

export const apiClient = _instance as unknown as TypedAxiosClient;
