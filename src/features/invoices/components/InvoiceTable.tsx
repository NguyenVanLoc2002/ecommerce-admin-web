import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText } from 'lucide-react';
import { DataTable } from '@/shared/components/table/DataTable';
import { TableToolbar } from '@/shared/components/table/TableToolbar';
import { Pagination } from '@/shared/components/table/Pagination';
import { StatusBadge } from '@/shared/components/ui/StatusBadge';
import { Select } from '@/shared/components/ui/Select';
import { SkeletonTable } from '@/shared/components/feedback/Skeleton';
import { ErrorCard } from '@/shared/components/feedback/ErrorCard';
import { EmptyState } from '@/shared/components/feedback/EmptyState';
import { formatMoney } from '@/shared/utils/formatMoney';
import { formatDateTime } from '@/shared/utils/formatDate';
import { routes } from '@/constants/routes';
import type { ColumnDef, SortState } from '@/shared/components/table/types';
import type { PaginatedResponse } from '@/shared/types/api.types';
import type { InvoiceSummary, InvoiceListParams } from '../types/invoice.types';

const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'ISSUED', label: 'Issued' },
  { value: 'PAID', label: 'Paid' },
  { value: 'VOIDED', label: 'Voided' },
];

interface InvoiceTableProps {
  data: PaginatedResponse<InvoiceSummary> | undefined;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  filters: InvoiceListParams;
  onFiltersChange: (updates: Partial<InvoiceListParams>) => void;
  sort: SortState | undefined;
  onSortChange: (sort: SortState) => void;
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
}: InvoiceTableProps) {
  const navigate = useNavigate();

  const columns = useMemo<ColumnDef<InvoiceSummary>[]>(
    () => [
      {
        id: 'invoiceCode',
        header: 'Invoice',
        enableSorting: true,
        cell: ({ row }) => (
          <div className="min-w-0">
            <button
              type="button"
              onClick={() => navigate(routes.invoices.detail(row.original.id))}
              className="rounded-sm font-mono text-sm font-bold text-primary-600 transition-colors hover:text-primary-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-1"
            >
              {row.original.invoiceCode}
            </button>
            <p className="mt-0.5 truncate text-xs text-gray-500">Order #{row.original.orderCode}</p>
          </div>
        ),
      },
      {
        id: 'receiverName',
        header: 'Receiver',
        cell: ({ row }) => (
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-gray-900">{row.original.receiverName}</p>
            <p className="text-xs text-gray-500">{row.original.receiverPhone}</p>
          </div>
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
        id: 'status',
        header: 'Status',
        enableSorting: true,
        cell: ({ row }) => <StatusBadge type="invoice" status={row.original.status} />,
      },
      {
        id: 'paidAt',
        header: 'Paid At',
        enableSorting: true,
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-xs text-gray-500">
            {row.original.paidAt ? formatDateTime(row.original.paidAt) : '-'}
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
    ],
    [navigate],
  );

  if (isLoading) return <SkeletonTable rows={8} />;
  if (isError) return <ErrorCard onRetry={onRetry} />;

  return (
    <div className="space-y-4">
      <TableToolbar
        searchValue={filters.invoiceCode ?? ''}
        onSearchChange={(invoiceCode) => onFiltersChange({ invoiceCode: invoiceCode || undefined })}
        searchPlaceholder="Search by invoice code..."
        filters={
          <Select
            options={STATUS_OPTIONS}
            value={filters.status ?? ''}
            onChange={(e) => onFiltersChange({ status: e.target.value || undefined })}
            className="h-9 w-36 text-sm"
          />
        }
      />

      <DataTable
        data={data?.items ?? []}
        columns={columns}
        getRowId={(row) => row.id}
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
          onPageSizeChange={(size) => onFiltersChange({ size })}
        />
      )}
    </div>
  );
}
