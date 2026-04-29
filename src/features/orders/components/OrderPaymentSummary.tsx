import { CreditCard } from 'lucide-react';
import { StatusBadge } from '@/shared/components/ui/StatusBadge';
import { formatMoney } from '@/shared/utils/formatMoney';
import type { PaymentMethod, OrderPaymentStatus } from '@/shared/types/enums';

const PAYMENT_METHOD_LABEL: Record<string, string> = {
  COD: 'Cash on Delivery',
  ONLINE: 'Online Payment',
  MOMO: 'MoMo',
  ZALO_PAY: 'ZaloPay',
  VNPAY: 'VNPay',
  BANK_TRANSFER: 'Bank Transfer',
};

interface OrderPaymentSummaryProps {
  paymentMethod: PaymentMethod;
  paymentStatus: OrderPaymentStatus | null;
  totalAmount: number;
}

export function OrderPaymentSummary({
  paymentMethod,
  paymentStatus,
  totalAmount,
}: OrderPaymentSummaryProps) {
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
            {PAYMENT_METHOD_LABEL[paymentMethod] ?? paymentMethod}
          </span>
        </div>

        {paymentStatus && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Status</span>
            <StatusBadge type="order-payment" status={paymentStatus} />
          </div>
        )}

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">Amount</span>
          <span className="text-sm font-semibold text-gray-900">{formatMoney(totalAmount)}</span>
        </div>
      </div>
    </div>
  );
}
