import { beforeEach, describe, expect, it, vi } from 'vitest';
import { decideOrderReturn, listOrderReturns, type OrderReturn } from '../services/orderReturnService';

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
});
