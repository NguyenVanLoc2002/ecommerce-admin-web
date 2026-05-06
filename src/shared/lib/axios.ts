import axios, {
  type AxiosError,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from 'axios';
import { clearClientAuthState } from './authSession';
import { AppError, type ApiError, type ApiResponse } from '../types/api.types';
import { useAuthStore } from '../stores/authStore';
import type { RefreshTokenResponse } from '../types/auth.types';
import { toast } from '../stores/uiStore';

declare module 'axios' {
  interface InternalAxiosRequestConfig {
    _retry?: boolean;
    _retryCount?: number;
  }
}

const AUTH_REFRESH_EXCLUSIONS = new Set([
  '/auth/login',
  '/auth/register',
  '/auth/refresh-token',
  '/auth/logout',
]);

const refreshClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15_000,
  withCredentials: true,
});

let isRefreshing = false;

type QueueEntry = {
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
};

let refreshQueue: QueueEntry[] = [];

function drainQueue(token: string | null, error: unknown = null) {
  refreshQueue.forEach(({ resolve, reject }) => {
    if (token !== null) {
      resolve(token);
      return;
    }

    reject(error);
  });
  refreshQueue = [];
}

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15_000,
});

function isRefreshExcluded(url?: string) {
  if (!url) {
    return false;
  }

  return Array.from(AUTH_REFRESH_EXCLUSIONS).some((path) => url.endsWith(path));
}

async function requestAccessTokenRefresh(): Promise<RefreshTokenResponse> {
  const response = await refreshClient.post<ApiResponse<RefreshTokenResponse>>(
    '/auth/refresh-token',
    undefined,
    { withCredentials: true },
  );

  return response.data.data;
}

function redirectToLogin() {
  if (window.location.pathname === '/login') {
    return;
  }

  const redirectPath = encodeURIComponent(window.location.pathname + window.location.search);
  window.location.replace(`/login?redirect=${redirectPath}`);
}

instance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

instance.interceptors.response.use(
  (response) => {
    if (
      response.status === 204 ||
      response.status === 205 ||
      response.data === '' ||
      response.data == null
    ) {
      return undefined as unknown as typeof response;
    }

    const body = response.data as ApiResponse<unknown> | null;
    if (body !== null && typeof body === 'object' && 'success' in body && 'data' in body) {
      return body.data as typeof response;
    }

    return response;
  },
  async (error: AxiosError) => {
    const config = error.config;

    if (!error.response && config?.method?.toUpperCase() === 'GET') {
      config._retryCount = (config._retryCount ?? 0) + 1;
      if (config._retryCount <= 2) {
        await new Promise<void>((resolve) => setTimeout(resolve, 1_000));
        return instance(config);
      }
    }

    const accessToken = useAuthStore.getState().accessToken;
    if (
      error.response?.status === 401 &&
      config &&
      !config._retry &&
      !isRefreshExcluded(config.url) &&
      accessToken
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          refreshQueue.push({
            resolve: (newToken) => {
              config.headers = config.headers ?? {};
              config.headers.Authorization = `Bearer ${newToken}`;
              resolve(instance(config));
            },
            reject,
          });
        });
      }

      config._retry = true;
      isRefreshing = true;

      try {
        const refreshedSession = await requestAccessTokenRefresh();
        useAuthStore.getState().setSession(refreshedSession);
        drainQueue(refreshedSession.accessToken);

        config.headers = config.headers ?? {};
        config.headers.Authorization = `Bearer ${refreshedSession.accessToken}`;
        return instance(config);
      } catch (refreshError) {
        drainQueue(null, refreshError);
        clearClientAuthState();
        toast.warning('Session expired. Please sign in again.');
        redirectToLogin();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    if (error.response?.data) {
      const apiError = error.response.data as ApiError;
      throw new AppError(apiError);
    }

    throw error;
  },
);

type TypedAxiosClient = {
  get<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T>;
  post<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T>;
  patch<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T>;
  put<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T>;
  delete<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T>;
};

export const apiClient = instance as unknown as TypedAxiosClient;
