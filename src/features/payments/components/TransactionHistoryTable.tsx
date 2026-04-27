import { RefreshCw } from 'lucide-react';
import { formatDateTime } from '@/shared/utils/formatDate';
import { formatMoney } from '@/shared/utils/formatMoney';
import { SkeletonTable } from '@/shared/components/feedback/Skeleton';
import { ErrorCard } from '@/shared/components/feedback/ErrorCard';
import { EmptyState } from '@/shared/components/feedback/EmptyState';
import { cn } from '@/shared/utils/cn';
import type { PaymentTransaction } from '../types/payment.types';

interface TransactionHistoryTableProps {
  transactions: PaymentTransaction[] | undefined;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
}

const STATUS_STYLES: Record<string, string> = {
  SUCCESS: 'bg-success-50 text-success-700 ring-success-200',
  SUCCEEDED: 'bg-success-50 text-success-700 ring-success-200',
  COMPLETED: 'bg-success-50 text-success-700 ring-success-200',
  PENDING: 'bg-warning-50 text-warning-700 ring-warning-200',
  PROCESSING: 'bg-warning-50 text-warning-700 ring-warning-200',
  FAILED: 'bg-danger-50 text-danger-700 ring-danger-200',
  ERROR: 'bg-danger-50 text-danger-700 ring-danger-200',
  REFUNDED: 'bg-gray-100 text-gray-700 ring-gray-200',
};

function titleCase(value: string): string {
  return value
    .toLowerCase()
    .split(/[_\s]+/)
    .map((p) => (p ? p[0]!.toUpperCase() + p.slice(1) : ''))
    .join(' ');
}

function StatusPill({ status }: { status: string }) {
  const key = status.toUpperCase();
  const style = STATUS_STYLES[key] ?? 'bg-gray-100 text-gray-700 ring-gray-200';
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset',
        style,
      )}
    >
      {titleCase(status)}
    </span>
  );
}

export function TransactionHistoryTable({
  transactions,
  isLoading,
  isError,
  onRetry,
}: TransactionHistoryTableProps) {
  if (isLoading) return <SkeletonTable rows={3} />;

  if (isError) {
    return <ErrorCard onRetry={onRetry} />;
  }

  if (!transactions || transactions.length === 0) {
    return (
      <EmptyState
        icon={<RefreshCw className="h-8 w-8" />}
        title="No transactions yet"
        message="Transactions will appear here once payment processing begins."
      />
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100">
            <th className="pb-2 pr-4 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Type</th>
            <th className="pb-2 pr-4 text-right text-xs font-medium uppercase tracking-wide text-gray-500">Amount</th>
            <th className="pb-2 pr-4 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Status</th>
            <th className="pb-2 pr-4 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Gateway Ref</th>
            <th className="pb-2 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Date</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {transactions.map((tx) => (
            <tr key={tx.id}>
              <td className="py-2.5 pr-4 text-sm font-semibold text-gray-800">{titleCase(tx.type)}</td>
              <td className="py-2.5 pr-4 text-right text-sm font-semibold tabular-nums text-gray-900">
                {formatMoney(tx.amount)}
              </td>
              <td className="py-2.5 pr-4">
                <StatusPill status={tx.status} />
              </td>
              <td className="py-2.5 pr-4">
                {tx.gatewayRef ? (
                  <span className="font-mono text-xs text-gray-500">{tx.gatewayRef}</span>
                ) : (
                  <span className="text-gray-300">—</span>
                )}
              </td>
              <td className="py-2.5 whitespace-nowrap text-xs text-gray-500">
                {formatDateTime(tx.createdAt)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
