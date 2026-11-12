import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { cleanParams } from '@/shared/utils/cleanParams';

export type TableFilters = object;

type AnyFilters = Record<string, unknown>;
type FilterKey<T extends TableFilters> = Extract<keyof T, string>;

interface UseTableFiltersOptions<T extends TableFilters> {
  namespace?: string;
  booleanKeys?: Array<FilterKey<T>>;
  numberKeys?: Array<FilterKey<T>>;
}

function fromSearchParams<T extends TableFilters>(
  params: URLSearchParams,
  defaults: T,
  options?: UseTableFiltersOptions<T>,
): T {
  const result = { ...defaults } as T;
  const resultValues = result as AnyFilters;
  const keys = Object.keys(defaults) as Array<FilterKey<T>>;

  for (const key of keys) {
    const raw = params.get(toParamKey(key, options?.namespace));
    if (raw === null) continue;

    const defaultVal = (defaults as AnyFilters)[key];
    if (typeof defaultVal === 'number' || isNumberKey(key, options?.numberKeys)) {
      const parsed = Number(raw);
      resultValues[key] = isNaN(parsed) ? defaultVal : parsed;
    } else if (typeof defaultVal === 'boolean' || isBooleanKey(key, options?.booleanKeys)) {
      resultValues[key] = raw === 'true';
    } else {
      resultValues[key] = raw;
    }
  }

  return result;
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
        ...Object.keys(filters),
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
      ...Object.keys(filters),
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
  booleanKeys?: Array<FilterKey<T>>,
): boolean {
  return booleanKeys?.includes(key as FilterKey<T>) ?? false;
}

function isNumberKey<T extends TableFilters>(
  key: string,
  numberKeys?: Array<FilterKey<T>>,
): boolean {
  return numberKeys?.includes(key as FilterKey<T>) ?? false;
}
