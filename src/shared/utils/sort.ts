import type { SortState } from '@/shared/components/table/types';

export function parseSortParam(value: string | undefined | null): SortState | undefined {
  if (!value) return undefined;
  const [column, direction] = value.split(',');
  if (!column) return undefined;
  if (direction !== 'asc' && direction !== 'desc') return undefined;
  return { column, direction };
}

export function buildSortParam(sort: SortState): string {
  return `${sort.column},${sort.direction}`;
}

export function nextSortState(
  current: SortState | undefined,
  column: string,
): SortState {
  if (current?.column === column) {
    return { column, direction: current.direction === 'asc' ? 'desc' : 'asc' };
  }
  return { column, direction: 'asc' };
}
