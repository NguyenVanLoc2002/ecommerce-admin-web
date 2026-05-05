import { describe, expect, it } from 'vitest';
import { SoftDeleteState } from '@/shared/types/api.types';
import { resolveProductListQuery } from '../utils/productListQuery';
import type { ProductListParams } from '../types/product.types';

const DEFAULT_FILTERS: ProductListParams = {
  page: 0,
  size: 20,
  sort: 'createdAt,desc',
  keyword: undefined,
  status: undefined,
  categoryId: undefined,
  brandId: undefined,
  minPrice: undefined,
  maxPrice: undefined,
  featured: undefined,
  deletedState: SoftDeleteState.ACTIVE,
};

describe('resolveProductListQuery', () => {
  it('preserves Vietnamese accents while trimming keyword text', () => {
    const resolved = resolveProductListQuery(
      {
        ...DEFAULT_FILTERS,
        keyword: '  áo thun  ',
      },
      '  áo thun  ',
    );

    expect(resolved.keyword).toBe('áo thun');
    expect(resolved.request.keyword).toBe('áo thun');
  });

  it('omits blank keyword and keeps normal filter params when search is cleared', () => {
    const resolved = resolveProductListQuery(
      {
        ...DEFAULT_FILTERS,
        keyword: '   ',
        categoryId: 'cat-1',
        brandId: 'brand-1',
        status: 'PUBLISHED',
        featured: false,
        minPrice: 100_000,
        maxPrice: 250_000,
      },
      '   ',
    );

    expect(resolved.isKeywordSearch).toBe(false);
    expect(resolved.request).toEqual({
      page: 0,
      size: 20,
      sort: 'createdAt,desc',
      categoryId: 'cat-1',
      brandId: 'brand-1',
      status: 'PUBLISHED',
      featured: false,
      minPrice: 100_000,
      maxPrice: 250_000,
    });
  });

  it('keeps keyword with category, brand, status, featured, and price filters', () => {
    const resolved = resolveProductListQuery(
      {
        ...DEFAULT_FILTERS,
        keyword: 'đầm',
        categoryId: 'cat-2',
        brandId: 'brand-2',
        status: 'DRAFT',
        featured: true,
        minPrice: 50_000,
        maxPrice: 125_000,
      },
      'đầm',
    );

    expect(resolved.request).toEqual({
      page: 0,
      size: 20,
      sort: 'createdAt,desc',
      keyword: 'đầm',
      categoryId: 'cat-2',
      brandId: 'brand-2',
      status: 'DRAFT',
      featured: true,
      minPrice: 50_000,
      maxPrice: 125_000,
    });
  });

  it('falls back to a backend-safe sort when keyword search is active', () => {
    const resolved = resolveProductListQuery(
      {
        ...DEFAULT_FILTERS,
        keyword: 'quần jean',
        sort: 'brandName,asc',
      },
      'quần jean',
    );

    expect(resolved.sort).toBe('createdAt,desc');
    expect(resolved.request.sort).toBe('createdAt,desc');
  });

  it('preserves a supported keyword-search sort field', () => {
    const resolved = resolveProductListQuery(
      {
        ...DEFAULT_FILTERS,
        keyword: 'áo sơ mi',
        sort: 'name,asc',
      },
      'áo sơ mi',
    );

    expect(resolved.sort).toBe('name,asc');
    expect(resolved.request.sort).toBe('name,asc');
  });

  it('maps deleted-state filters to backend isDeleted/includeDeleted params', () => {
    const deletedOnly = resolveProductListQuery({
      ...DEFAULT_FILTERS,
      deletedState: SoftDeleteState.DELETED,
    });
    const allRecords = resolveProductListQuery({
      ...DEFAULT_FILTERS,
      deletedState: SoftDeleteState.ALL,
    });

    expect(deletedOnly.request).toMatchObject({ isDeleted: true });
    expect(allRecords.request).toMatchObject({ includeDeleted: true });
  });
});
