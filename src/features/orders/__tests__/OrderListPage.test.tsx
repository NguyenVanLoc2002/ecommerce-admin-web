import React, { act } from 'react';
import { Simulate } from 'react-dom/test-utils';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { useOrdersMock } = vi.hoisted(() => ({
  useOrdersMock: vi.fn<(params: {
    keyword?: string;
    page: number;
    size: number;
    sort: string;
    status?: string;
    paymentMethod?: string;
  }) => unknown>(),
}));

vi.mock('../hooks/useOrders', () => ({ useOrders: useOrdersMock }));
vi.mock('@/shared/components/layout/AdminLayout', () => ({
  AdminLayout: ({ children }: React.PropsWithChildren) => <>{children}</>,
}));
vi.mock('@/shared/components/layout/PageHeader', () => ({ PageHeader: () => null }));
vi.mock('../components/OrderTable', () => ({
  OrderTable: ({ filters, onFiltersChange }: {
    filters: { keyword?: string; status?: string; page?: number };
    onFiltersChange: (updates: Record<string, unknown>) => void;
  }) => (
    <div>
      <input aria-label="order search" value={filters.keyword ?? ''}
        onChange={(event) => onFiltersChange({ keyword: event.target.value })} />
      <button onClick={() => onFiltersChange({ status: 'PROCESSING' })}>Set status</button>
    </div>
  ),
}));
vi.mock('../components/OrderFiltersDrawer', () => ({
  OrderFiltersDrawer: ({ onReset }: { onReset: () => void }) => (
    <button onClick={onReset}>Reset all filters</button>
  ),
}));

import { OrderListPage } from '../pages/OrderListPage';

describe('OrderListPage query state', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
    vi.useFakeTimers();
    useOrdersMock.mockReset();
    useOrdersMock.mockReturnValue({ data: undefined, isLoading: true, isError: false, refetch: vi.fn() });
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    void act(() => root.unmount());
    container.remove();
    vi.useRealTimers();
  });

  function render(path = '/') {
    void act(() => root.render(
      <MemoryRouter initialEntries={[path]}>
        <OrderListPage />
      </MemoryRouter>,
    ));
  }

  it('debounces keyword before requesting the server list', () => {
    render();
    const input = container.querySelector('input[aria-label="order search"]')!;
    void act(() => {
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set?.call(input, 'ORD-55');
      Simulate.change(input, { target: input });
    });

    void act(() => { vi.advanceTimersByTime(299); });
    expect(useOrdersMock.mock.lastCall?.[0].keyword).toBeUndefined();
    void act(() => { vi.advanceTimersByTime(1); });
    expect(useOrdersMock.mock.lastCall?.[0].keyword).toBe('ORD-55');
    expect(useOrdersMock.mock.lastCall?.[0].page).toBe(0);
  });

  it('resets query filters to the documented default page and sort', () => {
    render('/?keyword=ORD-55&status=PROCESSING&paymentMethod=COD&page=3');
    void act(() => { vi.advanceTimersByTime(300); });
    const reset = [...container.querySelectorAll('button')].find((button) => button.textContent === 'Reset all filters')!;
    void act(() => Simulate.click(reset));
    void act(() => { vi.advanceTimersByTime(300); });

    expect(useOrdersMock.mock.lastCall?.[0]).toMatchObject({
      page: 0,
      size: 20,
      sort: 'createdAt,desc',
      keyword: undefined,
      status: undefined,
      paymentMethod: undefined,
    });
  });
});
