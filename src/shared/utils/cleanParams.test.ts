import { describe, expect, it } from 'vitest';
import { cleanParams } from './cleanParams';

describe('cleanParams', () => {
  it('removes empty values while preserving valid false and zero values', () => {
    expect(
      cleanParams({
        keyword: '  jackets  ',
        emptyText: '   ',
        page: 0,
        size: 20,
        includeDeleted: false,
        minPrice: null,
        brandIds: [],
      }),
    ).toEqual({
      keyword: 'jackets',
      page: 0,
      size: 20,
      includeDeleted: false,
    });
  });
});
