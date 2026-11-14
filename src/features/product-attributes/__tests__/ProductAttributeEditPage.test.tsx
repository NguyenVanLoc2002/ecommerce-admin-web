import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, expect, it, vi } from 'vitest';
import { ProductAttributeEditPage } from '../pages/ProductAttributeEditPage';

const { useProductAttributeMock } = vi.hoisted(() => ({
  useProductAttributeMock: vi.fn(),
}));

vi.mock('../hooks/useProductAttribute', () => ({
  useProductAttribute: useProductAttributeMock,
}));

vi.mock('../hooks/useCreateProductAttribute', () => ({
  useCreateProductAttribute: () => ({ isPending: false, mutateAsync: vi.fn() }),
}));

vi.mock('../hooks/useUpdateProductAttribute', () => ({
  useUpdateProductAttribute: () => ({ isPending: false, mutateAsync: vi.fn() }),
}));

vi.mock('@/shared/hooks/useConfirmDialog', () => ({
  useConfirmDialog: () => ({ confirm: vi.fn() }),
}));

function renderEditPage() {
  const queryClient = new QueryClient();

  return renderToStaticMarkup(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/product-attributes/color/edit']}>
        <Routes>
          <Route path="/product-attributes/:id/edit" element={<ProductAttributeEditPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('ProductAttributeEditPage', () => {
  it('renders editable values in a table on a dedicated page', () => {
    useProductAttributeMock.mockReturnValue({
      data: {
        id: 'color',
        name: 'Color',
        code: 'COLOR',
        type: 'VARIANT',
        values: [
          { id: 'black', value: 'BLACK', displayValue: 'Black', isDeleted: false },
          { id: 'blue', value: 'BLUE', displayValue: 'Blue', isDeleted: false },
        ],
        createdAt: '2026-05-01T00:00:00Z',
        updatedAt: '2026-05-02T00:00:00Z',
        isDeleted: false,
      },
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    });

    const markup = renderEditPage();

    expect(markup).toContain('Edit attribute');
    expect(markup).toContain('Attribute definition');
    expect(markup).toContain('Values (2)');
    expect(markup).toContain('<table');
    expect(markup).toContain('Display label');
    expect(markup).toContain('aria-label="Value 1"');
    expect(markup).toContain('aria-label="Value 2"');
    expect(markup).toContain('Save changes');
    expect(markup).not.toContain('Edit Product Attribute');
  });
});
