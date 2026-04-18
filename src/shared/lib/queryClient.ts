import { QueryClient } from '@tanstack/react-query';
import { AppError } from '../types/api.types';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Lists use 30 s staleTime; detail queries override with 60 s per-hook
      staleTime: 30_000,
      // Keep unused data in cache for 5 min before GC
      gcTime: 5 * 60_000,
      // Don't retry on known API errors (4xx) — only on transient network issues
      retry: (failureCount, error) => {
        if (error instanceof AppError) return false;
        return failureCount < 2;
      },
      // Admin screens are internal tools; focus-refetch adds noise without value
      refetchOnWindowFocus: false,
    },
    mutations: {
      // Mutations are user-triggered; never auto-retry to prevent double-submit
      retry: false,
    },
  },
});
