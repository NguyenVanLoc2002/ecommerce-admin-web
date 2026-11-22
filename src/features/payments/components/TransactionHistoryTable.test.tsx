import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import type { PaymentTransaction } from '../types/payment.types';
import { TransactionHistoryTable } from './TransactionHistoryTable';

const transaction: PaymentTransaction = {
  id: 'transaction-1',
  paymentId: 'payment-1',
  type: 'PAYMENT',
  amount: 100000,
  status: 'SUCCESS',
  gatewayRef: null,
  note: null,
  referenceType: 'CAPTURE',
  createdAt: '2026-11-22T10:00:00',
};

describe('TransactionHistoryTable', () => {
  it('shows manual refund attention for money received after cancellation', () => {
    const html = renderToStaticMarkup(<TransactionHistoryTable
      transactions={[{ ...transaction, referenceType: 'LATE_SUCCESS_AFTER_CANCEL' }]}
      isLoading={false}
      isError={false}
      onRetry={() => undefined}
    />);

    expect(html).toContain('Refund required');
    expect(html).toContain('Reconcile and refund manually.');
  });

  it('does not show refund attention for a normal payment', () => {
    const html = renderToStaticMarkup(<TransactionHistoryTable
      transactions={[transaction]}
      isLoading={false}
      isError={false}
      onRetry={() => undefined}
    />);

    expect(html).toContain('Payment');
    expect(html).not.toContain('Refund required');
  });
});
