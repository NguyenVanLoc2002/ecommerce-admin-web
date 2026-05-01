import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, SlidersHorizontal } from 'lucide-react';
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
import type { InvoiceSummary, InvoiceListParams } from '../types/invoice.types';
import { InvoiceRowActions } from './InvoiceRowActions';

interface InvoiceTableProps {
  data: PaginatedResponse<InvoiceSummary> | undefined;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  filters: InvoiceListParams;
  onFiltersChange: (updates: Partial<InvoiceListParams>) => void;
  sort: SortState | undefined;
  onSortChange: (sort: SortState) => void;
  onOpenFilters: () => void;
}

export function InvoiceTable({
  data,
  isLoading,
  isError,
  onRetry,
  filters,
  onFiltersChange,
  sort,
  onSortChange,
  onOpenFilters,
}: InvoiceTableProps) {
  const navigate = useNavigate();
  const activeFilterCount = [
    filters.orderCode,
    filters.status,
    filters.dateFrom,
    filters.dateTo,
  ].filter((value) => value !== undefined && value !== '').length;

  const columns = useMemo<ColumnDef<InvoiceSummary>[]>(
    () => [
      {
        id: 'invoiceCode',
        header: 'Invoice Code',
        enableSorting: true,
        cell: ({ row }) => (
          <span className="font-mono text-sm font-semibold text-primary-600">
            {row.original.invoiceCode}
          </span>
        ),
      },
      {
        id: 'orderCode',
        header: 'Order Code',
        enableSorting: true,
        cell: ({ row }) => (
          <span className="font-mono text-sm text-gray-700">#{row.original.orderCode}</span>
        ),
      },
      {
        id: 'customerName',
        header: 'Customer',
        cell: ({ row }) => (
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-gray-900">{row.original.customerName}</p>
            {row.original.customerPhone && (
              <p className="truncate text-xs text-gray-500">{row.original.customerPhone}</p>
            )}
          </div>
        ),
      },
      {
        id: 'status',
        header: 'Status',
        enableSorting: true,
        cell: ({ row }) => <StatusBadge type="invoice" status={row.original.status} />,
      },
      {
        id: 'paymentStatus',
        header: 'Payment Status',
        enableSorting: true,
        cell: ({ row }) => (
          row.original.paymentStatus
            ? <StatusBadge type="order-payment" status={row.original.paymentStatus} />
            : <span className="text-xs text-gray-400">—</span>
        ),
      },
      {
        id: 'totalAmount',
        header: 'Total',
        enableSorting: true,
        headerClassName: 'text-right',
        className: 'text-right',
        cell: ({ row }) => (
          <span className="text-sm font-semibold tabular-nums text-gray-900">
            {formatMoney(row.original.totalAmount)}
          </span>
        ),
      },
      {
        id: 'issuedAt',
        header: 'Issued At',
        enableSorting: true,
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-xs text-gray-500">
            {formatDateTime(row.original.issuedAt)}
          </span>
        ),
      },
      {
        id: 'createdAt',
        header: 'Created At',
        enableSorting: true,
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-xs text-gray-500">
            {formatDateTime(row.original.createdAt)}
          </span>
        ),
      },
      {
        id: 'actions',
        header: '',
        className: 'w-16',
        cell: ({ row }) => <InvoiceRowActions invoice={row.original} />,
      },
    ],
    [],
  );

  if (isLoading) return <SkeletonTable rows={8} />;
  if (isError) return <ErrorCard onRetry={onRetry} />;

  return (
    <div className="space-y-4">
      <TableToolbar
        searchValue={filters.invoiceCode ?? ''}
        onSearchChange={(invoiceCode) =>
          onFiltersChange({ invoiceCode: invoiceCode || undefined, page: 0 })
        }
        searchPlaceholder="Search by invoice code..."
        actions={
          <Button
            variant="secondary"
            size="sm"
            onClick={onOpenFilters}
            leftIcon={<SlidersHorizontal className="h-4 w-4" />}
          >
            Filters
            {activeFilterCount > 0 && (
              <span className="ml-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary-600 text-[10px] font-bold text-white">
                {activeFilterCount}
              </span>
            )}
          </Button>
        }
      />

      <DataTable
        data={data?.items ?? []}
        columns={columns}
        getRowId={(row) => row.id}
        onRowClick={(row) => navigate(routes.invoices.detail(row.id))}
        sort={sort}
        onSortChange={onSortChange}
        emptyState={
          <EmptyState
            icon={<FileText className="h-10 w-10" />}
            title="No invoices found"
            message="Invoices generated from orders will appear here."
          />
        }
      />

      {data && data.totalPages > 1 && (
        <Pagination
          pagination={data}
          onPageChange={(page) => onFiltersChange({ page })}
          onPageSizeChange={(size) => onFiltersChange({ size, page: 0 })}
        />
      )}
    </div>
  );
}
