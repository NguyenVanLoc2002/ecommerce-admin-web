import { describe, expect, it } from 'vitest';
import { SoftDeleteState } from '@/shared/types/api.types';
import { resolveSoftDeleteState, toSoftDeleteQuery } from './softDelete';

describe('softDelete utilities', () => {
  it('maps active, deleted, and all filters to the backend contract params', () => {
    expect(toSoftDeleteQuery(SoftDeleteState.ACTIVE)).toEqual({});
    expect(toSoftDeleteQuery(SoftDeleteState.DELETED)).toEqual({ isDeleted: true });
    expect(toSoftDeleteQuery(SoftDeleteState.ALL)).toEqual({ includeDeleted: true });
  });

  it('falls back to the current filter when the API payload omits isDeleted', () => {
    expect(resolveSoftDeleteState({}, SoftDeleteState.ACTIVE)).toBe(false);
    expect(resolveSoftDeleteState({}, SoftDeleteState.DELETED)).toBe(true);
    expect(resolveSoftDeleteState({}, SoftDeleteState.ALL)).toBeUndefined();
  });

  it('prefers the explicit API field when isDeleted is present', () => {
    expect(resolveSoftDeleteState({ isDeleted: true }, SoftDeleteState.ACTIVE)).toBe(true);
    expect(resolveSoftDeleteState({ isDeleted: false }, SoftDeleteState.DELETED)).toBe(false);
  });
});
