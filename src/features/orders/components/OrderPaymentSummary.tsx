import { CreditCard } from 'lucide-react';
import { StatusBadge } from '@/shared/components/ui/StatusBadge';
import { formatMoney } from '@/shared/utils/formatMoney';
import { formatDateTime } from '@/shared/utils/formatDate';
import type { OrderPayment } from '../types/order.types';

const PAYMENT_METHOD_LABEL: Record<string, string> = {
  COD: 'Cash on Delivery',
  ONLINE: 'Online Payment',
};

interface OrderPaymentSummaryProps {
  payment: OrderPayment;
}

export function OrderPaymentSummary({ payment }: OrderPaymentSummaryProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 space-y-3">
      <div className="flex items-center gap-2">
        <CreditCard className="h-4 w-4 text-gray-400" />
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Payment</p>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">Method</span>
          <span className="text-sm font-medium text-gray-800">
            {PAYMENT_METHOD_LABEL[payment.method] ?? payment.method}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">Status</span>
          <StatusBadge type="payment" status={payment.status} />
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">Amount</span>
          <span className="text-sm font-semibold text-gray-900">{formatMoney(payment.amount)}</span>
        </div>

        {payment.paidAt && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Paid at</span>
            <span className="text-xs text-gray-600">{formatDateTime(payment.paidAt)}</span>
          </div>
        )}

        {payment.transactionId && (
          <div className="flex items-start justify-between gap-4">
            <span className="text-sm text-gray-500 shrink-0">Txn ID</span>
            <span className="text-xs font-mono text-gray-600 text-right break-all">
              {payment.transactionId}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
