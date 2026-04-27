import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, CreditCard, Hash, Calendar, AlertCircle, Copy, Check, ArrowUpRight } from 'lucide-react';
import { StatusBadge } from '@/shared/components/ui/StatusBadge';
import { Button } from '@/shared/components/ui/Button';
import { formatMoney } from '@/shared/utils/formatMoney';
import { formatDateTime } from '@/shared/utils/formatDate';
import { routes } from '@/constants/routes';
import { TransactionHistoryTable } from './TransactionHistoryTable';
import type { Payment, PaymentTransaction } from '../types/payment.types';

const METHOD_LABELS: Record<string, string> = {
  COD: 'Cash on Delivery',
  ONLINE: 'Online Payment',
};

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
      <div className="flex flex-col gap-4 rounded-lg border border-gray-200 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-6">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Amount</p>
            <p className="mt-0.5 text-2xl font-bold tabular-nums text-gray-900">
              {formatMoney(payment.amount)}
            </p>
          </div>
          <div className="hidden h-10 w-px bg-gray-200 sm:block" aria-hidden />
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Status</p>
            <div className="mt-1.5">
              <StatusBadge type="payment" status={payment.status} />
            </div>
          </div>
        </div>

        {canMarkPaid(payment) && (
          <Button
            size="md"
            leftIcon={<CheckCircle className="h-4 w-4" />}
            isLoading={isMarkingPaid}
            onClick={onMarkPaid}
          >
            Mark as Paid
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <p className="mb-3 text-xs font-medium uppercase tracking-wide text-gray-400">
              Transaction History
            </p>
            <TransactionHistoryTable
              transactions={transactions}
              isLoading={transactionsLoading}
              isError={transactionsError}
              onRetry={onRetryTransactions}
            />
          </div>
        </div>

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
        <InfoRow label="Method">
          <span className="text-sm font-medium text-gray-800">
            {METHOD_LABELS[payment.method] ?? payment.method}
          </span>
        </InfoRow>

        {payment.transactionId && (
          <InfoRow
            label="Transaction ID"
            icon={<Hash className="h-4 w-4 text-gray-400" />}
          >
            <CopyableText value={payment.transactionId} className="font-mono text-xs text-gray-600" />
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
  const navigate = useNavigate();

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 space-y-3">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Linked Order</p>

      <div className="space-y-1.5">
        <button
          type="button"
          onClick={() => navigate(routes.orders.detail(payment.orderId))}
          className="group inline-flex items-center gap-1 rounded-sm text-sm font-medium text-gray-900 transition-colors hover:text-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-1"
        >
          Order <span className="font-mono font-bold text-primary-600">#{payment.orderCode}</span>
          <ArrowUpRight className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100" />
        </button>
        <p className="text-sm text-gray-600">{payment.customer.fullName}</p>
        <p className="text-xs text-gray-400">{payment.customer.email}</p>
        {payment.customer.phone && (
          <p className="text-xs text-gray-400">{payment.customer.phone}</p>
        )}
      </div>
    </div>
  );
}

function CopyableText({ value, className }: { value: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    void navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <span className="group inline-flex items-center gap-1.5">
      <span className={className}>{value}</span>
      <button
        type="button"
        onClick={handleCopy}
        aria-label={copied ? 'Copied' : 'Copy'}
        className="inline-flex h-5 w-5 items-center justify-center rounded text-gray-300 opacity-0 transition-all hover:bg-gray-100 hover:text-gray-600 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 group-hover:opacity-100"
      >
        {copied ? <Check className="h-3 w-3 text-success-600" /> : <Copy className="h-3 w-3" />}
      </button>
    </span>
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
