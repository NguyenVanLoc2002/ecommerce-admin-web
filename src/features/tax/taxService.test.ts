import { beforeEach, describe, expect, it, vi } from 'vitest';
import { taxService } from './taxService';

const { get, put } = vi.hoisted(() => ({ get: vi.fn(), put: vi.fn() }));
vi.mock('@/shared/lib/axios', () => ({ apiClient: { get, put } }));

describe('taxService', () => {
  beforeEach(() => {
    get.mockReset();
    put.mockReset();
  });

  it('sends the last known revision and the exclusive end date when updating a rate', async () => {
    const rates = [{ fraction: 0.08, effectiveFrom: '2025-07-01', effectiveUntil: '2027-01-01', active: true }];
    await taxService.configure('STANDARD_REDUCIBLE', 2, rates);
    expect(put).toHaveBeenCalledWith('/admin/tax/categories/STANDARD_REDUCIBLE/schedule', { revision: 2, rates });
  });

  it('clears a product override using null so the backend chooses the default', async () => {
    await taxService.assign('product-id', null);
    expect(put).toHaveBeenCalledWith('/admin/tax/assignments/product-id', { categoryCode: null });
  });

  it('loads the checkout and final snapshots via independent endpoints', async () => {
    const estimate = { currency: 'VND', gross: 540000, net: 500000, vat: 40000 };
    const actual = { amounts: { currency: 'VND', gross: 540000, net: 490909, vat: 49091 } };
    get.mockResolvedValueOnce(estimate).mockResolvedValueOnce(actual);

    await expect(taxService.estimate('order-id')).resolves.toBe(estimate);
    await expect(taxService.finalized('order-id')).resolves.toBe(actual);
    expect(get.mock.calls).toEqual([
      ['/admin/tax/orders/order-id/estimate'],
      ['/admin/tax/orders/order-id/final'],
    ]);
  });
});
