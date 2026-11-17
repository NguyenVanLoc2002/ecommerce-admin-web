import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { OrderTable } from '../components/OrderTable';

function renderState(isLoading: boolean, isError: boolean) {
  return renderToStaticMarkup(
    <MemoryRouter>
      <OrderTable
        data={undefined}
        isLoading={isLoading}
        isError={isError}
        onRetry={vi.fn()}
        filters={{ page: 0, size: 20, sort: 'createdAt,desc' }}
        onFiltersChange={vi.fn()}
        sort={{ column: 'createdAt', direction: 'desc' }}
        onSortChange={vi.fn()}
        onOpenFilters={vi.fn()}
      />
    </MemoryRouter>,
  );
}

describe('OrderTable states', () => {
  it('renders a loading skeleton', () => {
    expect(renderState(true, false)).toContain('animate-pulse');
  });

  it('renders a retryable error state', () => {
    const markup = renderState(false, true);
    expect(markup).toContain('Something went wrong. Please try again.');
    expect(markup).toContain('Retry');
  });

  it('renders the empty result state', () => {
    expect(renderState(false, false)).toContain('No orders found');
  });
});
