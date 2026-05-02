import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataTable } from '@/shared/components/table/DataTable';
import { Pagination } from '@/shared/components/table/Pagination';
import { SkeletonTable } from '@/shared/components/feedback/Skeleton';
import { ErrorCard } from '@/shared/components/feedback/ErrorCard';
import { EmptyState } from '@/shared/components/feedback/EmptyState';
import { formatMoney } from '@/shared/utils/formatMoney';
import { formatDateTime } from '@/shared/utils/formatDate';
import { routes } from '@/constants/routes';
import type { ColumnDef } from '@/shared/components/table/types';
import type { PaginatedResponse } from '@/shared/types/api.types';
import type { VoucherUsage } from '../types/voucher.types';

interface VoucherUsageTableProps {
  data: PaginatedResponse<VoucherUsage> | undefined;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export function VoucherUsageTable({
  data,
  isLoading,
  isError,
  onRetry,
  onPageChange,
  onPageSizeChange,
}: VoucherUsageTableProps) {
  const navigate = useNavigate();

  const columns = useMemo<ColumnDef<VoucherUsage>[]>(
    () => [
      {
        id: 'orderCode',
        header: 'Order',
        cell: ({ row }) => (
          <button
            type="button"
            onClick={() => navigate(routes.orders.detail(row.original.orderId))}
            className="font-mono text-sm font-medium text-primary-600 hover:text-primary-700 hover:underline"
          >
            #{row.original.orderCode}
          </button>
        ),
      },
      {
        id: 'customer',
        header: 'Customer',
        cell: ({ row }) => (
          <span className="text-sm text-gray-700">{row.original.customerName}</span>
        ),
      },
      {
        id: 'usedAt',
        header: 'Used At',
        cell: ({ row }) => (
          <span className="text-xs text-gray-500 whitespace-nowrap">
            {formatDateTime(row.original.usedAt)}
          </span>
        ),
      },
      {
        id: 'discountAmount',
        header: 'Discount Applied',
        cell: ({ row }) => (
          <span className="text-sm font-medium text-gray-900 tabular-nums">
            {formatMoney(row.original.discountAmount)}
          </span>
        ),
      },
    ],
    [navigate],
  );

  if (isLoading) return <SkeletonTable rows={6} />;
  if (isError) return <ErrorCard onRetry={onRetry} />;

  return (
    <div className="space-y-4">
      <DataTable
        data={data?.items ?? []}
        columns={columns}
        getRowId={(row) => String(row.id)}
        emptyState={
          <EmptyState
            icon={null}
            title="No usages yet"
            message="This voucher has not been redeemed by any customer."
          />
        }
      />

      {data && data.totalPages > 1 && (
        <Pagination
          pagination={data}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />
      )}
    </div>
  );
}
