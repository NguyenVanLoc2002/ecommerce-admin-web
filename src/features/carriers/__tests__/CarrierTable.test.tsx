import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { CarrierTable } from '../components/CarrierTable';

vi.mock('@/features/carriers/components/CarrierRowActions', () => ({
  CarrierRowActions: () => React.createElement('div', null, 'Actions'),
}));

describe('CarrierTable', () => {
  it('renders carrier filters and list results', () => {
    const markup = renderToStaticMarkup(
      <CarrierTable
        data={{
          items: [
            {
              id: 'carrier-1',
              code: 'GHN_MAIN',
              name: 'Giao Hang Nhanh',
              providerType: 'GHN',
              status: 'ACTIVE',
              logoUrl: null,
              description: null,
              configEnabled: true,
              baseUrl: 'https://api.ghn.vn',
              hasApiKey: true,
              hasSecretKey: true,
              hasWebhookSecret: false,
              configJson: null,
              connectionStatus: 'FAILED',
              lastHealthCheckAt: '2026-05-16T09:30:00Z',
              lastHealthCheckError: 'Provider rejected the API key',
              createdAt: '2026-05-15T08:00:00Z',
              updatedAt: '2026-05-16T08:00:00Z',
            },
          ],
          page: 0,
          size: 20,
          totalItems: 1,
          totalPages: 1,
          hasNext: false,
          hasPrevious: false,
        }}
        isLoading={false}
        isError={false}
        onRetry={() => {}}
        filters={{ page: 0, size: 20, sort: 'updatedAt,desc' }}
        onFiltersChange={() => {}}
        sort={undefined}
        onSortChange={() => {}}
        onCreateNew={() => {}}
        onView={() => {}}
        onEdit={() => {}}
        onConfigure={() => {}}
      />,
    );

    expect(markup).toContain('Search shipping providers...');
    expect(markup).toContain('All providers');
    expect(markup).toContain('All statuses');
    expect(markup).toContain('Giao Hang Nhanh');
    expect(markup).toContain('GHN_MAIN');
    expect(markup).toContain('Enabled');
    expect(markup).toContain('Failed');
    expect(markup).toContain('Provider rejected the API key');
  });
});
