import { beforeEach, describe, expect, it, vi } from 'vitest';
import { productService } from '../services/productService';
import type { ProductListRequestParams } from '../utils/productListQuery';

const { getMock, postMock, patchMock, deleteMock } = vi.hoisted(() => ({
  getMock: vi.fn(),
  postMock: vi.fn(),
  patchMock: vi.fn(),
  deleteMock: vi.fn(),
}));

vi.mock('@/shared/lib/axios', () => ({
  apiClient: {
    get: getMock,
    post: postMock,
    patch: patchMock,
    delete: deleteMock,
  },
}));

describe('productService', () => {
  beforeEach(() => {
    getMock.mockReset();
    postMock.mockReset();
    patchMock.mockReset();
    deleteMock.mockReset();
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

  it('uses the documented product CRUD endpoints', async () => {
    const createBody = {
      name: 'Verification product',
      slug: 'verification-product',
      brandId: 'brand-1',
      categoryIds: ['category-1'],
      shortDescription: 'Created for catalog verification.',
      description: 'Created for catalog verification.',
      status: 'DRAFT' as const,
      featured: false,
    };
    const updateBody = {
      name: 'Updated verification product',
      featured: true,
    };

    await productService.create(createBody);
    await productService.update('product-1', updateBody);
    await productService.remove('product-1');

    expect(postMock).toHaveBeenCalledWith('/admin/products', createBody);
    expect(patchMock).toHaveBeenCalledWith('/admin/products/product-1', updateBody);
    expect(deleteMock).toHaveBeenCalledWith('/admin/products/product-1');
  });

  it('uses the URL-based product media endpoints', async () => {
    const body = {
      mediaUrl: 'https://cdn.example.com/shirt.jpg',
      mediaType: 'IMAGE' as const,
      sortOrder: 1,
      primary: true,
      variantId: null,
    };
    postMock.mockResolvedValue({ id: 'media-1', ...body });
    patchMock.mockResolvedValue({ id: 'media-1', ...body, sortOrder: 2 });
    deleteMock.mockResolvedValue(undefined);

    await productService.createMedia('product-1', body);
    await productService.updateMedia('product-1', 'media-1', { sortOrder: 2 });
    await productService.removeMedia('product-1', 'media-1');

    expect(postMock).toHaveBeenCalledWith('/admin/products/product-1/media', body);
    expect(patchMock).toHaveBeenCalledWith('/admin/products/product-1/media/media-1', { sortOrder: 2 });
    expect(deleteMock).toHaveBeenCalledWith('/admin/products/product-1/media/media-1');
  });
});
