import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { AppError } from '@/shared/types/api.types';
import { ProductEditPage } from '../pages/ProductEditPage';

vi.mock('../hooks/useProduct', () => ({
  useProduct: () => ({
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
  }),
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

describe('ProductEditPage', () => {
  it('shows the deleted/not-found state when the backend returns PRODUCT_NOT_FOUND', () => {
    const markup = renderToStaticMarkup(
      <MemoryRouter initialEntries={['/products/123']}>
        <Routes>
          <Route path="/products/:id" element={<ProductEditPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(markup).toContain('Product Not Found');
    expect(markup).toContain('Product not found or has been deleted.');
  });
});
