import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { SlidersHorizontal, CreditCard } from 'lucide-react';
import { DataTable } from '@/shared/components/table/DataTable';
import { TableToolbar } from '@/shared/components/table/TableToolbar';
import { Pagination } from '@/shared/components/table/Pagination';
import { StatusBadge } from '@/shared/components/ui/StatusBadge';
import { Button } from '@/shared/components/ui/Button';
import { SkeletonTable } from '@/shared/components/feedback/Skeleton';
import { ErrorCard } from '@/shared/components/feedback/ErrorCard';
import { EmptyState } from '@/shared/components/feedback/EmptyState';
import { formatMoney } from '@/shared/utils/formatMoney';
import { formatDateTime } from '@/shared/utils/formatDate';
import { routes } from '@/constants/routes';
import type { ColumnDef, SortState } from '@/shared/components/table/types';
import type { PaginatedResponse } from '@/shared/types/api.types';
import type { PaymentSummary, PaymentListParams } from '../types/payment.types';
import { PaymentRowActions } from './PaymentRowActions';

const METHOD_LABELS: Record<string, string> = {
  COD: 'COD',
  ONLINE: 'Online',
};

interface PaymentTableProps {
  data: PaginatedResponse<PaymentSummary> | undefined;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  filters: PaymentListParams;
  onFiltersChange: (updates: Partial<PaymentListParams>) => void;
  sort: SortState | undefined;
  onSortChange: (sort: SortState) => void;
  onOpenFilters: () => void;
}

export function PaymentTable({
  data,
  isLoading,
  isError,
  onRetry,
  filters,
  onFiltersChange,
  sort,
  onSortChange,
  onOpenFilters,
}: PaymentTableProps) {
  const navigate = useNavigate();

  const hasActiveFilters =
    filters.method !== undefined ||
    filters.status !== undefined ||
    filters.orderId !== undefined ||
    filters.fromDate !== undefined ||
    filters.toDate !== undefined;

  const columns = useMemo<ColumnDef<PaymentSummary>[]>(
    () => [
      {
        id: 'order',
        header: 'Order',
        cell: ({ row }) => (
          <div>
            <button
              type="button"
              onClick={() => navigate(routes.payments.detail(row.original.id))}
              className="font-mono text-sm font-semibold text-primary-600 hover:text-primary-700 hover:underline"
            >
              #{row.original.orderCode}
            </button>
            <p className="mt-0.5 text-xs text-gray-400">{row.original.customer.fullName}</p>
          </div>
        ),
      },
      {
        id: 'method',
        header: 'Method',
        cell: ({ row }) => (
          <span className="text-sm text-gray-700">
            {METHOD_LABELS[row.original.method] ?? row.original.method}
          </span>
        ),
      },
      {
        id: 'amount',
        header: 'Amount',
        enableSorting: true,
        cell: ({ row }) => (
          <span className="text-sm font-medium text-gray-900 tabular-nums">
            {formatMoney(row.original.amount)}
          </span>
        ),
      },
      {
        id: 'status',
        header: 'Status',
        enableSorting: true,
        cell: ({ row }) => (
          <StatusBadge type="payment" status={row.original.status} />
        ),
      },
      {
        id: 'paidAt',
        header: 'Paid At',
        enableSorting: true,
        cell: ({ row }) => (
          <span className="text-xs text-gray-500 whitespace-nowrap">
            {row.original.paidAt ? (
              formatDateTime(row.original.paidAt)
            ) : (
              <span className="text-gray-300">—</span>
            )}
          </span>
        ),
      },
      {
        id: 'createdAt',
        header: 'Created',
        enableSorting: true,
        cell: ({ row }) => (
          <span className="text-xs text-gray-500 whitespace-nowrap">
            {formatDateTime(row.original.createdAt)}
          </span>
        ),
      },
      {
        id: 'actions',
        header: '',
        className: 'w-16',
        cell: ({ row }) => <PaymentRowActions payment={row.original} />,
      },
    ],
    [navigate],
  );

  if (isLoading) return <SkeletonTable rows={8} />;
  if (isError) return <ErrorCard onRetry={onRetry} />;

  return (
    <div className="space-y-4">
      <TableToolbar
        searchValue={filters.keyword ?? ''}
        onSearchChange={(keyword) => onFiltersChange({ keyword: keyword || undefined })}
        searchPlaceholder="Search by order code or transaction ID…"
        actions={
          <Button
            variant="secondary"
            size="sm"
            onClick={onOpenFilters}
            leftIcon={<SlidersHorizontal className="h-4 w-4" />}
          >
            Filters
            {hasActiveFilters && (
              <span className="ml-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary-600 text-[10px] font-bold text-white">
                !
              </span>
            )}
          </Button>
        }
      />

      <DataTable
        data={data?.items ?? []}
        columns={columns}
        getRowId={(row) => String(row.id)}
        sort={sort}
        onSortChange={onSortChange}
        emptyState={
          <EmptyState
            icon={<CreditCard className="h-10 w-10" />}
            title="No payments found"
            message="Payments are created automatically when orders are placed."
          />
        }
      />

      {data && data.totalPages > 1 && (
        <Pagination
          pagination={data}
          onPageChange={(page) => onFiltersChange({ page } as Partial<PaymentListParams>)}
          onPageSizeChange={(size) => onFiltersChange({ size } as Partial<PaymentListParams>)}
        />
      )}
    </div>
  );
}
