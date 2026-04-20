import { RefreshCw } from 'lucide-react';
import { formatDateTime } from '@/shared/utils/formatDate';
import { formatMoney } from '@/shared/utils/formatMoney';
import { SkeletonTable } from '@/shared/components/feedback/Skeleton';
import { ErrorCard } from '@/shared/components/feedback/ErrorCard';
import { EmptyState } from '@/shared/components/feedback/EmptyState';
import type { PaymentTransaction } from '../types/payment.types';

interface TransactionHistoryTableProps {
  transactions: PaymentTransaction[] | undefined;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
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
            <th className="pb-2 pr-4 text-left text-xs font-medium text-gray-500">Type</th>
            <th className="pb-2 pr-4 text-left text-xs font-medium text-gray-500">Amount</th>
            <th className="pb-2 pr-4 text-left text-xs font-medium text-gray-500">Status</th>
            <th className="pb-2 pr-4 text-left text-xs font-medium text-gray-500">Gateway Ref</th>
            <th className="pb-2 text-left text-xs font-medium text-gray-500">Date</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {transactions.map((tx) => (
            <tr key={tx.id}>
              <td className="py-2.5 pr-4 font-medium text-gray-800">{tx.type}</td>
              <td className="py-2.5 pr-4 tabular-nums text-gray-700">
                {formatMoney(tx.amount)}
              </td>
              <td className="py-2.5 pr-4">
                <span className="text-xs font-medium text-gray-600">{tx.status}</span>
              </td>
              <td className="py-2.5 pr-4">
                {tx.gatewayRef ? (
                  <span className="font-mono text-xs text-gray-500">{tx.gatewayRef}</span>
                ) : (
                  <span className="text-gray-300">—</span>
                )}
              </td>
              <td className="py-2.5 text-xs text-gray-500 whitespace-nowrap">
                {formatDateTime(tx.createdAt)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
