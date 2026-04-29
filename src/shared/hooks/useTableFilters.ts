import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { PaginationParams } from '@/shared/types/api.types';

export type TableFilters = PaginationParams & Record<string, string | number | boolean | undefined>;

type AnyFilters = PaginationParams & Record<string, unknown>;

function toSearchParams(filters: AnyFilters): URLSearchParams {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== '') {
      params.set(key, String(value));
    }
  }
  return params;
}

function fromSearchParams(params: URLSearchParams, defaults: AnyFilters): AnyFilters {
  const result: AnyFilters = { ...defaults };
  for (const key of Object.keys(defaults)) {
    const raw = params.get(key);
    if (raw === null) continue;
    const defaultVal = defaults[key];
    if (typeof defaultVal === 'number') {
      const parsed = Number(raw);
      result[key] = isNaN(parsed) ? defaultVal : parsed;
    } else if (typeof defaultVal === 'boolean') {
      result[key] = raw === 'true';
    } else {
      result[key] = raw;
    }
  }
  return result;
}

export function useTableFilters<T extends PaginationParams>(
  defaults: T,
): [T, (updates: Partial<T>) => void, () => void] {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = fromSearchParams(searchParams, defaults as AnyFilters) as T;

  const setFilters = useCallback(
    (updates: Partial<T>) => {
      const next = { ...filters, ...updates, page: 0 } as T;
      if ('page' in updates) {
        (next as AnyFilters).page = (updates as AnyFilters).page ?? 0;
      }
      setSearchParams(toSearchParams(next as AnyFilters), { replace: true });
    },
    [filters, setSearchParams],
  );

  const resetFilters = useCallback(() => {
    setSearchParams(toSearchParams(defaults as AnyFilters), { replace: true });
  }, [defaults, setSearchParams]);

  return [filters, setFilters, resetFilters];
}
