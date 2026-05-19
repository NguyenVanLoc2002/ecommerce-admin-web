import { beforeEach, describe, expect, it, vi } from 'vitest';
import { productService } from '../services/productService';
import type { ProductListRequestParams } from '../utils/productListQuery';

const { getMock, postMock } = vi.hoisted(() => ({
  getMock: vi.fn(),
  postMock: vi.fn(),
}));

vi.mock('@/shared/lib/axios', () => ({
  apiClient: {
    get: getMock,
    post: postMock,
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('productService', () => {
  beforeEach(() => {
    getMock.mockReset();
    postMock.mockReset();
  });

  it('preserves backend pagination fields and does not client-filter product results', async () => {
    const params: ProductListRequestParams = {
      page: 0,
      size: 20,
      sort: 'createdAt,desc',
      keyword: 'áo',
      featured: false,
    };

    getMock.mockResolvedValue({
      items: [
        {
          id: 'prod-1',
          name: 'Váy công sở',
          slug: 'vay-cong-so',
          shortDescription: 'Office dress',
          thumbnailUrl: null,
          minPrice: 150000,
          maxPrice: 200000,
          status: 'PUBLISHED',
          featured: false,
          brandName: 'Acme',
          categoryNames: ['Women'],
          createdAt: '2026-05-01T10:00:00Z',
        },
        {
          id: 'prod-2',
          name: 'Áo thun basic',
          slug: 'ao-thun-basic',
          shortDescription: 'T-shirt',
          thumbnailUrl: null,
          minPrice: 99000,
          maxPrice: 99000,
          status: 'DRAFT',
          featured: true,
          brandName: 'Basics',
          categoryNames: ['Tops'],
          createdAt: '2026-05-02T10:00:00Z',
        },
      ],
      page: 0,
      size: 20,
      totalItems: 37,
      totalPages: 2,
      hasNext: true,
      hasPrevious: false,
    });

    const response = await productService.getList(params);

    expect(getMock).toHaveBeenCalledWith('/admin/products', { params });
    expect(response.items).toHaveLength(2);
    expect(response.items.map((item) => item.name)).toEqual([
      'Váy công sở',
      'Áo thun basic',
    ]);
    expect(response.totalItems).toBe(37);
    expect(response.totalPages).toBe(2);
    expect(response.page).toBe(0);
    expect(response.size).toBe(20);
    expect(response.hasNext).toBe(true);
    expect(response.hasPrevious).toBe(false);
  });

  it('calls the admin product search reindex endpoint', async () => {
    postMock.mockResolvedValue({ totalProcessed: 128 });

    const response = await productService.reindexSearch();

    expect(postMock).toHaveBeenCalledWith('/admin/products/search/reindex');
    expect(response).toEqual({ totalProcessed: 128 });
  });
});
