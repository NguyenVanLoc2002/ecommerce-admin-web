import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, expect, it, vi } from 'vitest';
import { CategoryEditPage } from '../pages/CategoryEditPage';

const { useCategoryMock } = vi.hoisted(() => ({ useCategoryMock: vi.fn() }));

vi.mock('../hooks/useCategory', () => ({ useCategory: useCategoryMock }));
vi.mock('../hooks/useCategories', () => ({ useCategories: () => ({ data: { items: [] } }) }));
vi.mock('../hooks/useCreateCategory', () => ({ useCreateCategory: () => ({ isPending: false, mutateAsync: vi.fn() }) }));
vi.mock('../hooks/useUpdateCategory', () => ({ useUpdateCategory: () => ({ isPending: false, mutateAsync: vi.fn() }) }));
vi.mock('@/shared/hooks/useConfirmDialog', () => ({ useConfirmDialog: () => ({ confirm: vi.fn() }) }));

function renderEditPage() {
  const queryClient = new QueryClient();
  return renderToStaticMarkup(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/categories/women/edit']}>
        <Routes>
          <Route path="/categories/:id/edit" element={<CategoryEditPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('CategoryEditPage', () => {
  it('renders a dedicated edit workspace instead of a modal', () => {
    useCategoryMock.mockReturnValue({
      data: {
        id: 'women', parentId: null, name: 'Women', slug: 'women', description: null,
        imageUrl: null, status: 'ACTIVE', sortOrder: 1, createdAt: '2026-05-01T00:00:00Z', isDeleted: false,
      },
      isLoading: false, isError: false, error: null, refetch: vi.fn(),
    });

    const markup = renderEditPage();

    expect(markup).toContain('Edit category');
    expect(markup).toContain('Category information');
    expect(markup).toContain('Catalog structure');
    expect(markup).toContain('Customer-facing content');
    expect(markup).toContain('Save changes');
    expect(markup).not.toContain('role="dialog"');
  });
});
