import { useMemo } from 'react';
import { Activity } from 'lucide-react';
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
import type { StockMovement, StockMovementParams, Warehouse } from '../types/inventory.types';

const MOVEMENT_TYPE_OPTIONS = [
  { value: '', label: 'All types' },
  { value: 'IMPORT', label: 'Import' },
  { value: 'ADJUSTMENT', label: 'Adjustment' },
  { value: 'RESERVATION', label: 'Reservation' },
  { value: 'RELEASE', label: 'Release' },
  { value: 'FULFILLMENT', label: 'Fulfillment' },
];

const movementTypeStyle: Record<string, string> = {
  IMPORT: 'bg-success-50 text-success-700 border-success-200',
  ADJUSTMENT: 'bg-warning-50 text-warning-700 border-warning-200',
  RESERVATION: 'bg-primary-50 text-primary-700 border-primary-200',
  RELEASE: 'bg-gray-100 text-gray-600 border-gray-200',
  FULFILLMENT: 'bg-gray-100 text-gray-600 border-gray-200',
};

interface StockMovementsTableProps {
  data: PaginatedResponse<StockMovement> | undefined;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  filters: StockMovementParams;
  onFiltersChange: (updates: Partial<StockMovementParams>) => void;
  warehouses: Warehouse[];
}

export function StockMovementsTable({
  data,
  isLoading,
  isError,
  onRetry,
  filters,
  onFiltersChange,
  warehouses,
}: StockMovementsTableProps) {
  const warehouseOptions = [
    { value: '', label: 'All warehouses' },
    ...warehouses.map((w) => ({ value: String(w.id), label: w.name })),
  ];

  const columns = useMemo<ColumnDef<StockMovement>[]>(
    () => [
      {
        id: 'date',
        header: 'Date',
        cell: ({ row }) => (
          <span className="text-xs text-gray-500 whitespace-nowrap">
            {formatDateTime(row.original.createdAt)}
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
        id: 'type',
        header: 'Type',
        cell: ({ row }) => (
          <span
            className={cn(
              'inline-flex items-center rounded border px-2 py-0.5 text-xs font-medium',
              movementTypeStyle[row.original.type] ?? 'bg-gray-100 text-gray-600',
            )}
          >
            {row.original.type}
          </span>
        ),
      },
      {
        id: 'quantity',
        header: 'Qty',
        headerClassName: 'text-right',
        className: 'text-right tabular-nums',
        cell: ({ row }) => {
          const qty = row.original.quantity;
          const isPositive = qty > 0;
          return (
            <span
              className={cn(
                'font-semibold',
                isPositive ? 'text-success-700' : 'text-danger-600',
              )}
            >
              {isPositive ? '+' : ''}{qty}
            </span>
          );
        },
      },
      {
        id: 'note',
        header: 'Note',
        cell: ({ row }) => (
          <span className="text-xs text-gray-400 max-w-[200px] truncate block">
            {row.original.note ?? row.original.reason ?? '—'}
          </span>
        ),
      },
      {
        id: 'by',
        header: 'By',
        cell: ({ row }) => (
          <span className="text-xs text-gray-500">{row.original.createdBy}</span>
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
              options={MOVEMENT_TYPE_OPTIONS}
              value={filters.type ?? ''}
              onChange={(e) => onFiltersChange({ type: e.target.value || undefined })}
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
            icon={<Activity className="h-10 w-10" />}
            title="No movements yet"
            message="Stock movements will appear here after imports or adjustments."
          />
        }
      />

      {data && data.totalPages > 1 && (
        <Pagination
          pagination={data}
          onPageChange={(page) => onFiltersChange({ page } as Partial<StockMovementParams>)}
          onPageSizeChange={(size) => onFiltersChange({ size } as Partial<StockMovementParams>)}
        />
      )}
    </div>
  );
}
