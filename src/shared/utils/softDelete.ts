import {
  SoftDeleteState,
  type SoftDeleteQueryParams,
  type SoftDeleteState as SoftDeleteStateValue,
  type SoftDeletableRecord,
} from '@/shared/types/api.types';

export const DEFAULT_SOFT_DELETE_STATE = SoftDeleteState.ACTIVE;

export function toSoftDeleteQuery(
  state: SoftDeleteStateValue = DEFAULT_SOFT_DELETE_STATE,
): SoftDeleteQueryParams {
  switch (state) {
    case SoftDeleteState.DELETED:
      return { isDeleted: true };
    case SoftDeleteState.ALL:
      return { includeDeleted: true };
    case SoftDeleteState.ACTIVE:
    default:
      return {};
  }
}

export function resolveSoftDeleteState(
  record: SoftDeletableRecord,
  state: SoftDeleteStateValue = DEFAULT_SOFT_DELETE_STATE,
): boolean | undefined {
  if (typeof record.isDeleted === 'boolean') {
    return record.isDeleted;
  }

  if (state === SoftDeleteState.ACTIVE) {
    return false;
  }

  if (state === SoftDeleteState.DELETED) {
    return true;
  }

  return undefined;
}
