import { useMemo } from 'react';
import { BookMarked } from 'lucide-react';
import { DataTable } from '@/shared/components/table/DataTable';
import { TableToolbar } from '@/shared/components/table/TableToolbar';
import { Pagination } from '@/shared/components/table/Pagination';
import { Select } from '@/shared/components/ui/Select';
import { SkeletonTable } from '@/shared/components/feedback/Skeleton';
import { ErrorCard } from '@/shared/components/feedback/ErrorCard';
import { EmptyState } from '@/shared/components/feedback/EmptyState';
import { formatDateTime } from '@/shared/utils/formatDate';
import { cn } from '@/shared/utils/cn';
import type { ColumnDef } from '@/shared/components/table/types';
import type { PaginatedResponse } from '@/shared/types/api.types';
import type {
  Reservation,
  ReservationParams,
  ReservationStatus,
  Warehouse,
} from '../types/inventory.types';

const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'RELEASED', label: 'Released' },
  { value: 'FULFILLED', label: 'Fulfilled' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

const reservationStatusStyle: Record<ReservationStatus, string> = {
  ACTIVE: 'bg-primary-50 text-primary-700 border-primary-200',
  RELEASED: 'bg-gray-100 text-gray-600 border-gray-200',
  FULFILLED: 'bg-success-50 text-success-700 border-success-200',
  CANCELLED: 'bg-danger-50 text-danger-600 border-danger-200',
};

interface ReservationTableProps {
  data: PaginatedResponse<Reservation> | undefined;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  filters: ReservationParams;
  onFiltersChange: (updates: Partial<ReservationParams>) => void;
  warehouses: Warehouse[];
}

export function ReservationTable({
  data,
  isLoading,
  isError,
  onRetry,
  filters,
  onFiltersChange,
  warehouses,
}: ReservationTableProps) {
  const warehouseOptions = [
    { value: '', label: 'All warehouses' },
    ...warehouses.map((w) => ({ value: String(w.id), label: w.name })),
  ];

  const columns = useMemo<ColumnDef<Reservation>[]>(
    () => [
      {
        id: 'order',
        header: 'Order',
        cell: ({ row }) => (
          <span className="font-mono text-sm font-medium text-gray-800">
            #{row.original.orderCode}
          </span>
        ),
      },
      {
        id: 'variant',
        header: 'Variant',
        cell: ({ row }) => (
          <div>
            <p className="text-sm font-medium text-gray-900 font-mono">
              {row.original.variantSku}
            </p>
            <p className="text-xs text-gray-400">{row.original.variantName}</p>
          </div>
        ),
      },
      {
        id: 'warehouse',
        header: 'Warehouse',
        cell: ({ row }) => (
          <span className="text-sm text-gray-600">{row.original.warehouseName}</span>
        ),
      },
      {
        id: 'quantity',
        header: 'Qty',
        headerClassName: 'text-right',
        className: 'text-right tabular-nums font-medium',
        cell: ({ row }) => row.original.quantity,
      },
      {
        id: 'status',
        header: 'Status',
        cell: ({ row }) => (
          <span
            className={cn(
              'inline-flex items-center rounded border px-2 py-0.5 text-xs font-medium',
              reservationStatusStyle[row.original.status] ?? 'bg-gray-100 text-gray-600',
            )}
          >
            {row.original.status}
          </span>
        ),
      },
      {
        id: 'expiresAt',
        header: 'Expires',
        cell: ({ row }) => (
          <span className="text-xs text-gray-500">
            {row.original.expiresAt ? formatDateTime(row.original.expiresAt) : '—'}
          </span>
        ),
      },
      {
        id: 'createdAt',
        header: 'Created',
        cell: ({ row }) => (
          <span className="text-xs text-gray-400">{formatDateTime(row.original.createdAt)}</span>
        ),
      },
    ],
    [],
  );

  if (isLoading) return <SkeletonTable rows={8} />;
  if (isError) return <ErrorCard onRetry={onRetry} />;

  return (
    <div className="space-y-4">
      <TableToolbar
        filters={
          <>
            <Select
              options={warehouseOptions}
              value={String(filters.warehouseId ?? '')}
              onChange={(e) =>
                onFiltersChange({
                  warehouseId: e.target.value ? Number(e.target.value) : undefined,
                })
              }
              className="h-9 w-44 text-sm"
            />
            <Select
              options={STATUS_OPTIONS}
              value={filters.status ?? ''}
              onChange={(e) => onFiltersChange({ status: e.target.value || undefined })}
              className="h-9 w-36 text-sm"
            />
          </>
        }
      />

      <DataTable
        data={data?.items ?? []}
        columns={columns}
        getRowId={(row) => String(row.id)}
        emptyState={
          <EmptyState
            icon={<BookMarked className="h-10 w-10" />}
            title="No reservations found"
            message="Active order reservations will appear here."
          />
        }
      />

      {data && data.totalPages > 1 && (
        <Pagination
          pagination={data}
          onPageChange={(page) => onFiltersChange({ page } as Partial<ReservationParams>)}
          onPageSizeChange={(size) => onFiltersChange({ size } as Partial<ReservationParams>)}
        />
      )}
    </div>
  );
}
