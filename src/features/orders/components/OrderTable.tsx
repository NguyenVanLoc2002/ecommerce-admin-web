import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { SlidersHorizontal, ShoppingBag, Eye } from 'lucide-react';
import { DataTable } from '@/shared/components/table/DataTable';
import { TableToolbar } from '@/shared/components/table/TableToolbar';
import { Pagination } from '@/shared/components/table/Pagination';
import { StatusBadge } from '@/shared/components/ui/StatusBadge';
import { Badge } from '@/shared/components/ui/Badge';
import { Button } from '@/shared/components/ui/Button';
import { SkeletonTable } from '@/shared/components/feedback/Skeleton';
import { ErrorCard } from '@/shared/components/feedback/ErrorCard';
import { EmptyState } from '@/shared/components/feedback/EmptyState';
import { formatMoney } from '@/shared/utils/formatMoney';
import { formatDateTime } from '@/shared/utils/formatDate';
import { routes } from '@/constants/routes';
import type { ColumnDef, SortState } from '@/shared/components/table/types';
import type { PaginatedResponse } from '@/shared/types/api.types';
import type { OrderStatus, PaymentStatus } from '@/shared/types/enums';
import type { OrderSummary, OrderListParams } from '../types/order.types';

const PAYMENT_METHOD_LABEL: Record<string, string> = {
  COD: 'COD',
  ONLINE: 'Online',
};

interface OrderTableProps {
  data: PaginatedResponse<OrderSummary> | undefined;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  filters: OrderListParams;
  onFiltersChange: (updates: Partial<OrderListParams>) => void;
  sort: SortState | undefined;
  onSortChange: (sort: SortState) => void;
  onOpenFilters: () => void;
}

export function OrderTable({
  data,
  isLoading,
  isError,
  onRetry,
  filters,
  onFiltersChange,
  sort,
  onSortChange,
  onOpenFilters,
}: OrderTableProps) {
  const navigate = useNavigate();

  const hasActiveFilters =
    filters.status || filters.paymentStatus;

  const columns = useMemo<ColumnDef<OrderSummary>[]>(
    () => [
      {
        id: 'code',
        header: 'Order',
        cell: ({ row }) => (
          <button
            type="button"
            onClick={() => navigate(routes.orders.detail(row.original.id))}
            className="font-mono text-sm font-semibold text-primary-600 hover:text-primary-700 hover:underline"
          >
            #{row.original.orderCode}
          </button>
        ),
      },
      {
        id: 'status',
        header: 'Status',
        enableSorting: true,
        cell: ({ row }) => (
          <StatusBadge type="order" status={row.original.status as OrderStatus} />
        ),
      },
      {
        id: 'payment',
        header: 'Payment',
        cell: ({ row }) => (
          <div className="flex flex-col gap-1">
            {row.original.paymentStatus && (
              <StatusBadge type="payment" status={row.original.paymentStatus as PaymentStatus} />
            )}
            {row.original.paymentMethod && (
              <Badge variant="default">
                {PAYMENT_METHOD_LABEL[row.original.paymentMethod] ?? row.original.paymentMethod}
              </Badge>
            )}
          </div>
        ),
      },
      {
        id: 'total',
        header: 'Total',
        enableSorting: true,
        headerClassName: 'text-right',
        className: 'text-right tabular-nums',
        cell: ({ row }) => (
          <span className="text-sm font-semibold text-gray-900">
            {formatMoney(row.original.totalAmount)}
          </span>
        ),
      },
      {
        id: 'createdAt',
        header: 'Date',
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
        cell: ({ row }) => (
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => navigate(routes.orders.detail(row.original.id))}
            aria-label="View order"
          >
            <Eye className="h-4 w-4" />
          </Button>
        ),
      },
    ],
    [navigate],
  );

  if (isLoading) return <SkeletonTable rows={8} />;
  if (isError) return <ErrorCard onRetry={onRetry} />;

  return (
    <div className="space-y-4">
      <TableToolbar
        searchValue={''}
        onSearchChange={() => undefined}
        searchPlaceholder="Search by order code or customer…"
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
            icon={<ShoppingBag className="h-10 w-10" />}
            title="No orders found"
            message="Orders will appear here once customers place them."
          />
        }
      />

      {data && data.totalPages > 1 && (
        <Pagination
          pagination={data}
          onPageChange={(page) => onFiltersChange({ page } as Partial<OrderListParams>)}
          onPageSizeChange={(size) => onFiltersChange({ size } as Partial<OrderListParams>)}
        />
      )}
    </div>
  );
}
