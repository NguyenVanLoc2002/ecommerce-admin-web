import { CheckCircle, CreditCard, Hash, Calendar, AlertCircle } from 'lucide-react';
import { StatusBadge } from '@/shared/components/ui/StatusBadge';
import { Button } from '@/shared/components/ui/Button';
import { formatMoney } from '@/shared/utils/formatMoney';
import { formatDateTime } from '@/shared/utils/formatDate';
import { TransactionHistoryTable } from './TransactionHistoryTable';
import type { Payment, PaymentTransaction } from '../types/payment.types';

interface PaymentDetailProps {
  payment: Payment;
  transactions: PaymentTransaction[] | undefined;
  transactionsLoading: boolean;
  transactionsError: boolean;
  onRetryTransactions: () => void;
  isMarkingPaid: boolean;
  onMarkPaid: () => void;
}

const canMarkPaid = (payment: Payment) =>
  payment.method === 'COD' && payment.status === 'PENDING';

export function PaymentDetail({
  payment,
  transactions,
  transactionsLoading,
  transactionsError,
  onRetryTransactions,
  isMarkingPaid,
  onMarkPaid,
}: PaymentDetailProps) {
  return (
    <div className="space-y-6">
      {/* Status + action row */}
      <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">Status</span>
          <StatusBadge type="payment" status={payment.status} />
        </div>
        {canMarkPaid(payment) && (
          <Button
            size="sm"
            leftIcon={<CheckCircle className="h-4 w-4" />}
            isLoading={isMarkingPaid}
            onClick={onMarkPaid}
          >
            Mark as Paid
          </Button>
        )}
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left — transaction history */}
        <div className="lg:col-span-2">
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <h2 className="mb-4 text-sm font-semibold text-gray-900">Transaction History</h2>
            <TransactionHistoryTable
              transactions={transactions}
              isLoading={transactionsLoading}
              isError={transactionsError}
              onRetry={onRetryTransactions}
            />
          </div>
        </div>

        {/* Right sidebar */}
        <div className="space-y-4">
          <PaymentInfoCard payment={payment} />
          <OrderLinkCard payment={payment} />
        </div>
      </div>
    </div>
  );
}

function PaymentInfoCard({ payment }: { payment: Payment }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 space-y-3">
      <div className="flex items-center gap-2">
        <CreditCard className="h-4 w-4 text-gray-400" />
        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
          Payment Details
        </p>
      </div>

      <div className="space-y-2.5">
        <InfoRow label="Amount">
          <span className="text-sm font-semibold text-gray-900 tabular-nums">
            {formatMoney(payment.amount)}
          </span>
        </InfoRow>

        <InfoRow label="Method">
          <span className="text-sm font-medium text-gray-800">{payment.method}</span>
        </InfoRow>

        {payment.transactionId && (
          <InfoRow
            label="Transaction ID"
            icon={<Hash className="h-4 w-4 text-gray-400" />}
          >
            <span className="font-mono text-xs text-gray-600">{payment.transactionId}</span>
          </InfoRow>
        )}

        {payment.paidAt && (
          <InfoRow
            label="Paid At"
            icon={<Calendar className="h-4 w-4 text-gray-400" />}
          >
            <span className="text-sm text-gray-700">{formatDateTime(payment.paidAt)}</span>
          </InfoRow>
        )}

        {payment.failureReason && (
          <div className="rounded border border-danger-100 bg-danger-50 p-2.5">
            <div className="flex items-start gap-1.5">
              <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-danger-500" />
              <p className="text-xs text-danger-700">{payment.failureReason}</p>
            </div>
          </div>
        )}

        <div className="border-t border-gray-100 pt-2.5">
          <InfoRow label="Created">
            <span className="text-xs text-gray-500">{formatDateTime(payment.createdAt)}</span>
          </InfoRow>
        </div>
      </div>
    </div>
  );
}

function OrderLinkCard({ payment }: { payment: Payment }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 space-y-3">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Linked Order</p>

      <div className="space-y-1.5">
        <p className="text-sm font-medium text-gray-900">
          Order{' '}
          <span className="font-mono text-primary-600">#{payment.orderCode}</span>
        </p>
        <p className="text-sm text-gray-600">{payment.customer.fullName}</p>
        <p className="text-xs text-gray-400">{payment.customer.email}</p>
        {payment.customer.phone && (
          <p className="text-xs text-gray-400">{payment.customer.phone}</p>
        )}
      </div>
    </div>
  );
}

function InfoRow({
  label,
  icon,
  children,
}: {
  label: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-2 shrink-0">
        {icon ?? <span className="h-4 w-4" />}
        <span className="text-sm text-gray-500">{label}</span>
      </div>
      <div className="text-right">{children}</div>
    </div>
  );
}
