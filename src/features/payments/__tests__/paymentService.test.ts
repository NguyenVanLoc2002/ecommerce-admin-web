import { beforeEach, describe, expect, it, vi } from 'vitest';
import { paymentService } from '../services/paymentService';

const { getMock, postMock, putMock } = vi.hoisted(() => ({
  getMock: vi.fn(),
  postMock: vi.fn(),
  putMock: vi.fn(),
}));

vi.mock('@/shared/lib/axios', () => ({
  apiClient: {
    get: getMock,
    post: postMock,
    put: putMock,
  },
}));

describe('paymentService', () => {
  beforeEach(() => {
    getMock.mockReset();
    postMock.mockReset();
    putMock.mockReset();
    getMock.mockResolvedValue({ items: [], page: 0, size: 20, totalItems: 0, totalPages: 0 });
  });

  it('loads the MoMo integration from the typed admin endpoint', async () => {
    await paymentService.getMomoIntegration();

    expect(getMock).toHaveBeenCalledWith('/admin/payments/integration/momo');
  });

  it('saves a partial MoMo integration payload without altering untouched fields', async () => {
    await paymentService.updateMomoIntegration({
      enabled: true,
      partnerCode: 'partner-code',
      connectTimeoutMs: 15000,
    });

    expect(putMock).toHaveBeenCalledWith('/admin/payments/integration/momo', {
      enabled: true,
      partnerCode: 'partner-code',
      connectTimeoutMs: 15000,
    });
  });

  it('loads the PayPal integration from the typed admin endpoint', async () => {
    await paymentService.getPaypalIntegration();

    expect(getMock).toHaveBeenCalledWith('/admin/payments/integration/paypal');
  });

  it('preserves late payment reconciliation marker in transaction history', async () => {
    getMock.mockResolvedValueOnce([{
      id: 'transaction-1',
      status: 'SUCCESS',
      amount: 100,
      referenceType: 'LATE_SUCCESS_AFTER_CANCEL',
      note: 'Admin refund required',
    }]);

    const transactions = await paymentService.getTransactions('payment-1');

    expect(transactions[0]?.referenceType).toBe('LATE_SUCCESS_AFTER_CANCEL');
    expect(transactions[0]?.note).toBe('Admin refund required');
  });

  it('saves the PayPal integration payload with advanced sandbox settings', async () => {
    await paymentService.updatePaypalIntegration({
      environment: 'sandbox',
      clientSecret: 'new-secret',
      conversionRateVndToUsd: 26000,
    });

    expect(putMock).toHaveBeenCalledWith('/admin/payments/integration/paypal', {
      environment: 'sandbox',
      clientSecret: 'new-secret',
      conversionRateVndToUsd: 26000,
    });
  });
});
