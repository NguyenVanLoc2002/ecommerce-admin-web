import { beforeEach, describe, expect, it, vi } from 'vitest';
import { attributeCatalogService } from '../services/attributeCatalogService';
import { catalogService } from '../services/catalogService';

const { getMock } = vi.hoisted(() => ({
  getMock: vi.fn(),
}));

vi.mock('@/shared/lib/axios', () => ({
  apiClient: {
    get: getMock,
  },
}));

describe('catalog option services', () => {
  beforeEach(() => {
    getMock.mockReset();
    getMock.mockResolvedValue({ items: [] });
  });

  it('fetches category and brand selectors with active-only soft delete params', async () => {
    await catalogService.getCategories();
    await catalogService.getBrands();

    expect(getMock).toHaveBeenNthCalledWith(1, '/admin/categories', {
      params: {
        page: 0,
        size: 200,
        sort: 'name,asc',
      },
    });

    expect(getMock).toHaveBeenNthCalledWith(2, '/admin/brands', {
      params: {
        page: 0,
        size: 200,
        sort: 'name,asc',
      },
    });
  });

  it('fetches variant attribute selectors with active-only soft delete params', async () => {
    await attributeCatalogService.getVariantAttributes();

    expect(getMock).toHaveBeenCalledWith('/admin/product-attributes', {
      params: {
        type: 'VARIANT',
        page: 0,
        size: 100,
        sort: 'name,asc',
      },
    });
  });
});
