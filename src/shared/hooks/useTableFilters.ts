import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { cleanParams } from '@/shared/utils/cleanParams';

export type TableFilters = Record<string, string | number | boolean | undefined>;

type AnyFilters = Record<string, unknown>;

interface UseTableFiltersOptions<T extends TableFilters> {
  namespace?: string;
  booleanKeys?: Array<keyof T>;
  numberKeys?: Array<keyof T>;
}

function fromSearchParams<T extends AnyFilters>(
  params: URLSearchParams,
  defaults: T,
  options?: UseTableFiltersOptions<T>,
): T {
  const result: AnyFilters = { ...defaults };
  const keys = Object.keys(defaults);

  for (const key of keys) {
    const raw = params.get(toParamKey(key, options?.namespace));
    if (raw === null) continue;

    const defaultVal = defaults[key];
    if (typeof defaultVal === 'number' || isNumberKey(key, options?.numberKeys)) {
      const parsed = Number(raw);
      result[key] = isNaN(parsed) ? defaultVal : parsed;
    } else if (typeof defaultVal === 'boolean' || isBooleanKey(key, options?.booleanKeys)) {
      result[key] = raw === 'true';
    } else {
      result[key] = raw;
    }
  }

  return result as T;
}

export function useTableFilters<T extends TableFilters>(
  defaults: T,
  options?: UseTableFiltersOptions<T>,
): [T, (updates: Partial<T>) => void, () => void] {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = fromSearchParams(searchParams, defaults, options);

  const setFilters = useCallback(
    (updates: Partial<T>) => {
      const next = { ...filters, ...updates } as T;
      const changedFilterKeys = Object.keys(updates).filter(
        (key) => key !== 'page' && key !== 'size' && key !== 'sort',
      );

      if (!('page' in updates) && 'page' in next && changedFilterKeys.length > 0) {
        (next as AnyFilters).page = 0;
      }

      const nextSearchParams = new URLSearchParams(searchParams);
      const managedKeys = new Set([
        ...Object.keys(defaults),
        ...Object.keys(filters as AnyFilters),
        ...Object.keys(updates as AnyFilters),
      ]);

      for (const key of managedKeys) {
        nextSearchParams.delete(toParamKey(key, options?.namespace));
      }

      const cleanedNext = cleanParams(next as AnyFilters);
      for (const [key, value] of Object.entries(cleanedNext)) {
        nextSearchParams.set(toParamKey(key, options?.namespace), String(value));
      }

      setSearchParams(nextSearchParams, { replace: true });
    },
    [defaults, filters, options, searchParams, setSearchParams],
  );

  const resetFilters = useCallback(() => {
    const nextSearchParams = new URLSearchParams(searchParams);
    const managedKeys = new Set([
      ...Object.keys(defaults),
      ...Object.keys(filters as AnyFilters),
    ]);

    for (const key of managedKeys) {
      nextSearchParams.delete(toParamKey(key, options?.namespace));
    }

    const cleanedDefaults = cleanParams(defaults as AnyFilters);
    for (const [key, value] of Object.entries(cleanedDefaults)) {
      nextSearchParams.set(toParamKey(key, options?.namespace), String(value));
    }

    setSearchParams(nextSearchParams, { replace: true });
  }, [defaults, filters, options, searchParams, setSearchParams]);

  return [filters, setFilters, resetFilters];
}

function toParamKey(key: string, namespace?: string): string {
  return namespace ? `${namespace}.${key}` : key;
}

function isBooleanKey<T extends TableFilters>(
  key: string,
  booleanKeys?: Array<keyof T>,
): boolean {
  return booleanKeys?.includes(key as keyof T) ?? false;
}

function isNumberKey<T extends TableFilters>(
  key: string,
  numberKeys?: Array<keyof T>,
): boolean {
  return numberKeys?.includes(key as keyof T) ?? false;
}
