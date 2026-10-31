import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AppError } from '@/shared/types/api.types';
import { ProductEditPage } from '../pages/ProductEditPage';
import type { Product } from '../types/product.types';

const { useProductMock } = vi.hoisted(() => ({
  useProductMock: vi.fn(),
}));

vi.mock('../hooks/useProduct', () => ({
  useProduct: useProductMock,
}));

vi.mock('../hooks/useCreateProduct', () => ({
  useCreateProduct: () => ({ isPending: false }),
}));

vi.mock('../hooks/useUpdateProduct', () => ({
  useUpdateProduct: () => ({ isPending: false }),
}));

vi.mock('../hooks/useCatalogOptions', () => ({
  useCategoryOptions: () => ({ data: [] }),
  useBrandOptions: () => ({ data: [] }),
}));

function renderProductEdit(initialPath = '/products/123') {
  const queryClient = new QueryClient();

  return renderToStaticMarkup(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          <Route path="/products/:id" element={<ProductEditPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

function product(overrides: Partial<Product> = {}): Product {
  return {
    id: 'prod-1',
    name: 'Linen Shirt',
    slug: 'linen-shirt',
    shortDescription: 'Breathable shirt',
    description: 'Long description',
    thumbnailUrl: null,
    minPrice: 100000,
    maxPrice: 120000,
    status: 'DRAFT',
    featured: false,
    brandName: 'Acme',
    brand: { id: 'brand-1', name: 'Acme', slug: 'acme' },
    categoryNames: ['Tops'],
    categories: [{ id: 'cat-1', name: 'Tops', slug: 'tops' }],
    variants: [
      {
        id: 'variant-1',
        productId: 'prod-1',
        sku: 'LINEN-WHT-M',
        barcode: null,
        variantName: 'White / M',
        basePrice: 100000,
        salePrice: null,
        compareAtPrice: null,
        weightGram: 250,
        status: 'ACTIVE',
        attributes: [],
        isDeleted: false,
      },
    ],
    media: [],
    variantCount: 1,
    activeVariantCount: 1,
    createdAt: '2026-05-01T00:00:00Z',
    updatedAt: '2026-05-02T00:00:00Z',
    isDeleted: false,
    ...overrides,
  };
}

describe('ProductEditPage', () => {
  beforeEach(() => {
    useProductMock.mockReset();
  });

  it('shows the deleted/not-found state when the backend returns PRODUCT_NOT_FOUND', () => {
    useProductMock.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new AppError({
        success: false,
        code: 'PRODUCT_NOT_FOUND',
        message: 'Product not found',
        path: '/api/v1/admin/products/123',
        timestamp: '2026-05-01T00:00:00Z',
      }),
      refetch: vi.fn(),
    });

    const markup = renderProductEdit();

    expect(markup).toContain('Product Not Found');
    expect(markup).toContain('Product not found or has been deleted.');
  });

  it('renders product media and uses product-level primary media for the preview', () => {
    useProductMock.mockReturnValue({
      data: product({
        media: [
          {
            id: 'media-variant',
            mediaUrl: 'https://cdn.example.com/variant-white.jpg',
            mediaType: 'IMAGE',
            sortOrder: 0,
            primary: true,
            variantId: 'variant-1',
          },
          {
            id: 'media-gallery',
            mediaUrl: 'https://cdn.example.com/gallery-main.jpg',
            mediaType: 'IMAGE',
            sortOrder: 2,
            primary: true,
            variantId: null,
          },
        ],
      }),
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    });

    const markup = renderProductEdit();

    expect(markup).toContain('Product Media');
    expect(markup).toContain('Product gallery');
    expect(markup).toContain('Variant: White / M');
    expect(markup).toContain('2 items');
    expect(markup).toContain('https://cdn.example.com/gallery-main.jpg');
  });
});
