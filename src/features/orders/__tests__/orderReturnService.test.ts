import { beforeEach, describe, expect, it, vi } from 'vitest';
import { decideOrderReturn, getReturnDetail, listOrderReturns, submitReturnHandling, submitReturnExchange, type OrderReturn } from '../services/orderReturnService';

const mocks = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn() }));
vi.mock('@/shared/lib/axios', () => ({ apiClient: mocks }));

describe('orderReturnService', () => {
  beforeEach(() => vi.clearAllMocks());

  it('sends queue filters and pagination to the admin returns endpoint', async () => {
    const filters = { orderId: 'order-1', status: 'REQUESTED', page: 1 } as const;
    await listOrderReturns(filters);
    expect(mocks.get).toHaveBeenCalledWith('/admin/returns', { params: filters });
  });

  it('sends the selected return, reason and retry key with a decision', async () => {
    const entry: OrderReturn = {
      id: 'return-1', orderId: 'order-1', status: 'REQUESTED',
      createdAt: '2026-11-24T00:00:00Z', reason: 'DEFECTIVE', note: '',
      items: [{ orderItemId: 'item-1', quantity: 1 }],
    };

    await decideOrderReturn(entry, 'approve', 'Verified defect', 'retry-key');
    expect(mocks.post).toHaveBeenCalledWith('/admin/orders/order-1/returns/return-1/approve',
      { reason: 'Verified defect' }, { headers: { 'Idempotency-Key': 'retry-key' } });
  });

  it('sends UTC delivery evidence and scopes replacement to the selected exchange', async () => {
    const entry: OrderReturn = {
      id: 'return-1', orderId: 'order-1', status: 'PENDING_DELIVERY_VERIFICATION',
      createdAt: '2026-11-24T00:00:00Z', reason: 'DEFECTIVE', note: '', items: [],
    };
    await decideOrderReturn(entry, 'verify-delivery', 'Carrier delivery receipt', 'verify-key', '2026-11-23T10:00:00');
    expect(mocks.post).toHaveBeenCalledWith('/admin/orders/order-1/returns/return-1/verify-delivery',
      { reason: 'Carrier delivery receipt', deliveredAt: '2026-11-23T10:00:00' },
      { headers: { 'Idempotency-Key': 'verify-key' } });

    await submitReturnExchange(entry, { action: 'replacement', exchangeId: 'exchange-1' });
    expect(mocks.post).toHaveBeenCalledWith('/admin/orders/order-1/returns/return-1/exchanges/exchange-1/replacement');
  });

  it('sends actual quantities for partial receipt and preserves the retry key', async () => {
    const entry: OrderReturn = {
      id: 'return-1', orderId: 'order-1', status: 'APPROVED',
      createdAt: '2026-11-24T00:00:00Z', reason: 'DEFECTIVE', note: '',
      items: [{ orderItemId: 'item-1', quantity: 3 }],
    };
    const receipt = {
      note: 'One unit received',
      items: [{ orderItemId: 'item-1', quantity: 1, restock: 0, damaged: 0 }],
    };

    await getReturnDetail(entry);
    await submitReturnHandling(entry, 'receive', receipt, 'receipt-key');
    expect(mocks.get).toHaveBeenCalledWith('/admin/returns/order-1/return-1');
    expect(mocks.post).toHaveBeenCalledWith('/admin/orders/order-1/returns/return-1/receive',
      receipt, { headers: { 'Idempotency-Key': 'receipt-key' } });
  });
});
