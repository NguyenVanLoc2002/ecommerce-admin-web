import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { SoftDeleteState } from '@/shared/types/api.types';
import { BrandTable } from '../components/BrandTable';

vi.mock('@/features/brands/components/BrandRowActions', () => ({
  BrandRowActions: () => React.createElement('div', null, 'Actions'),
}));

describe('BrandTable', () => {
  it('renders record status badges for active and deleted rows', () => {
    const markup = renderToStaticMarkup(
      <BrandTable
        data={{
          items: [
            {
              id: 'brand-1',
              name: 'Alpha',
              slug: 'alpha',
              description: null,
              logoUrl: null,
              status: 'ACTIVE',
              productCount: 4,
              createdAt: '2026-05-01T00:00:00Z',
              updatedAt: '2026-05-01T00:00:00Z',
              isDeleted: false,
            },
            {
              id: 'brand-2',
              name: 'Beta',
              slug: 'beta',
              description: null,
              logoUrl: null,
              status: 'INACTIVE',
              productCount: 0,
              createdAt: '2026-05-01T00:00:00Z',
              updatedAt: '2026-05-01T00:00:00Z',
              isDeleted: true,
            },
          ],
          page: 0,
          size: 20,
          totalItems: 2,
          totalPages: 1,
          hasNext: false,
          hasPrevious: false,
        }}
        isLoading={false}
        isError={false}
        onRetry={() => {}}
        filters={{ page: 0, size: 20, sort: 'name,asc', deletedState: SoftDeleteState.ALL }}
        onFiltersChange={() => {}}
        sort={undefined}
        onSortChange={() => {}}
        onEdit={() => {}}
        onCreateNew={() => {}}
      />,
    );

    expect(markup).toContain('Record Status');
    expect(markup).toContain('Deleted');
    expect(markup).toContain('Active');
  });
});
