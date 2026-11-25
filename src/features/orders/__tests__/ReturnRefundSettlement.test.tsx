import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { queryKeys } from '@/constants/queryKeys';
import { useAuthStore } from '@/shared/stores/authStore';
import { ReturnRefundSettlement } from '../components/ReturnRefundSettlement';
import type { OrderReturn, ReturnDetail, ReturnRefund } from '../services/orderReturnService';

const { post, confirm } = vi.hoisted(() => ({ post: vi.fn(), confirm: vi.fn() }));
vi.mock('@/shared/lib/axios', () => ({ apiClient: { post } }));
vi.mock('@/shared/hooks/useConfirmDialog', () => ({ useConfirmDialog: () => ({ confirm }) }));

const request: OrderReturn = {
  id: 'return-1', orderId: 'order-1', status: 'INSPECTED',
  createdAt: '2026-11-24T00:00:00Z', reason: 'DEFECTIVE', note: '', items: [],
};
const pending: ReturnRefund = {
  paymentId: 'payment-1', refundCode: 'RFD1', status: 'PENDING', amount: 120000,
};

function Screen() {
  const { data } = useQuery<ReturnDetail>({
    queryKey: queryKeys.orders.returnDetail(request.id),
    enabled: false,
  });
  return data?.refund ? <ReturnRefundSettlement entry={request} refund={data.refund} /> : null;
}

describe('Return refund settlement', () => {
  let container: HTMLDivElement;
  let root: Root;
  let client: QueryClient;

  beforeEach(() => {
    post.mockReset();
    confirm.mockReset().mockResolvedValue(true);
    client = new QueryClient();
    container = document.createElement('div');
    document.body.append(container);
    root = createRoot(container);
  });

  afterEach(async () => {
    await act(() => root.unmount());
    client.clear();
    useAuthStore.getState().clear();
    container.remove();
  });

  async function render(refund: ReturnRefund, email: string) {
    useAuthStore.setState({ user: { email, roles: ['ADMIN'] } });
    client.setQueryData(queryKeys.orders.returnDetail(request.id), {
      request, refund, receipt: null, inspection: null,
    } satisfies ReturnDetail);
    await act(() => root.render(
      <MemoryRouter>
        <QueryClientProvider client={client}><Screen /></QueryClientProvider>
      </MemoryRouter>,
    ));
  }

  async function submit(reference: string) {
    const input = container.querySelector<HTMLInputElement>('input[name="reference"]');
    if (!input?.form) throw new Error('Expected settlement form');
    const form = input.form;
    input.value = reference;
    await act(() => { form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })); });
  }

  it('keeps a pending PayPal result visible and only announces a confirmed server result', async () => {
    const refund = { ...pending, paymentMethod: 'ONLINE' };
    post.mockResolvedValueOnce(refund).mockResolvedValueOnce({ ...refund, status: 'COMPLETED' });
    await render(refund, 'admin@example.test');
    await submit('PP-REFUND');
    await vi.waitFor(() => expect(container.textContent).toContain('no completed result'));
    expect(container.textContent).not.toContain('Refund confirmed.');
    await submit('PP-REFUND');
    await vi.waitFor(() => expect(container.textContent).toContain('Refund confirmed.'));
    expect(post).toHaveBeenCalledWith('/admin/orders/order-1/returns/return-1/refund/paypal/verify',
      { reference: 'PP-REFUND' });
  });

  it('records COD evidence and exposes confirmation to another Admin only', async () => {
    const refund = { ...pending, paymentMethod: 'COD' };
    const processing = { ...refund, status: 'PROCESSING',
      settlementSubmittedBy: 'maker@example.test', settlementReference: 'COD:TRANSFER-1' };
    post.mockResolvedValueOnce(processing).mockResolvedValueOnce({ ...processing, status: 'COMPLETED' });
    await render(refund, 'maker@example.test');
    await submit('TRANSFER-1');
    await vi.waitFor(() => expect(container.textContent).toContain('A different Admin must confirm'));
    expect(container.textContent).not.toContain('Review and confirm transfer');
    await render(processing, 'checker@example.test');
    const button = [...container.querySelectorAll('button')].find((element) => element.textContent === 'Review and confirm transfer');
    if (!button) throw new Error('Expected checker confirmation');
    await act(() => button.click());
    await vi.waitFor(() => expect(container.textContent).toContain('Refund confirmed.'));
    expect(post).toHaveBeenNthCalledWith(1, '/admin/orders/order-1/returns/return-1/refund/cod/evidence',
      { reference: 'TRANSFER-1' });
    expect(post).toHaveBeenNthCalledWith(2, '/admin/orders/order-1/returns/return-1/refund/cod/confirm', undefined);
  });
});
