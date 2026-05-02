import { useMemo } from 'react';
import { Activity } from 'lucide-react';
import { DataTable } from '@/shared/components/table/DataTable';
import { TableToolbar } from '@/shared/components/table/TableToolbar';
import { Pagination } from '@/shared/components/table/Pagination';
import { Badge } from '@/shared/components/ui/Badge';
import { CopyValueButton } from '@/shared/components/ui/CopyValueButton';
import { Select } from '@/shared/components/ui/Select';
import { SkeletonTable } from '@/shared/components/feedback/Skeleton';
import { ErrorCard } from '@/shared/components/feedback/ErrorCard';
import { EmptyState } from '@/shared/components/feedback/EmptyState';
import { formatDateTime } from '@/shared/utils/formatDate';
import { formatEnumLabel } from '@/shared/utils/formatEnumLabel';
import type { ColumnDef } from '@/shared/components/table/types';
import type { PaginatedResponse } from '@/shared/types/api.types';
import type { StockMovement, StockMovementParams, Warehouse } from '../types/inventory.types';

const MOVEMENT_TYPE_OPTIONS = [
  { value: '', label: 'All types' },
  { value: 'IMPORT', label: 'Import' },
  { value: 'EXPORT', label: 'Export' },
  { value: 'ADJUSTMENT', label: 'Adjustment' },
  { value: 'RETURN', label: 'Return' },
];

const movementTypeVariantMap = {
  IMPORT: 'success',
  EXPORT: 'danger',
  ADJUSTMENT: 'warning',
  RETURN: 'info',
} as const;

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
    ...warehouses.map((warehouse) => ({ value: String(warehouse.id), label: warehouse.name })),
  ];

  const columns = useMemo<ColumnDef<StockMovement>[]>(
    () => [
      {
        id: 'date',
        header: 'Date',
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-xs text-gray-500">
            {formatDateTime(row.original.createdAt)}
          </span>
        ),
      },
      {
        id: 'variant',
        header: 'Variant',
        cell: ({ row }) => {
          const primaryLabel = row.original.variantName || row.original.sku || 'Unknown variant';
          const secondaryLabel = row.original.variantName && row.original.sku
            ? row.original.sku
            : null;

          return (
            <div>
              <p className="text-sm font-medium text-gray-900">{primaryLabel}</p>
              <div className="mt-0.5 flex items-center gap-2">
                {secondaryLabel && (
                  <p className="font-mono text-xs text-gray-400">{secondaryLabel}</p>
                )}
                {!row.original.variantName && row.original.variantId && (
                  <CopyValueButton
                    value={row.original.variantId}
                    label="Copy ID"
                    className="px-0 py-0 text-[11px] text-gray-400 hover:bg-transparent hover:text-gray-600"
                  />
                )}
              </div>
            </div>
          );
        },
      },
      {
        id: 'warehouse',
        header: 'Warehouse',
        cell: ({ row }) => {
          const hasWarehouseName = Boolean(row.original.warehouseName);
          return (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                {row.original.warehouseName || 'Unknown warehouse'}
              </span>
              {!hasWarehouseName && row.original.warehouseId && (
                <CopyValueButton
                  value={row.original.warehouseId}
                  label="Copy ID"
                  className="px-0 py-0 text-[11px] text-gray-400 hover:bg-transparent hover:text-gray-600"
                />
              )}
            </div>
          );
        },
      },
      {
        id: 'type',
        header: 'Type',
        cell: ({ row }) => (
          <Badge variant={resolveMovementTypeVariant(row.original.movementType)}>
            {formatEnumLabel(row.original.movementType)}
          </Badge>
        ),
      },
      {
        id: 'quantity',
        header: 'Qty',
        headerClassName: 'text-right',
        className: 'text-right tabular-nums',
        cell: ({ row }) => (
          <span className="font-semibold text-gray-700">{row.original.quantity}</span>
        ),
      },
      {
        id: 'note',
        header: 'Note',
        cell: ({ row }) => (
          <span className="block max-w-[200px] truncate text-xs text-gray-400">
            {row.original.note ?? 'No note'}
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
              onChange={(event) =>
                onFiltersChange({
                  warehouseId: event.target.value || undefined,
                })
              }
              className="h-9 w-44 text-sm"
            />
            <Select
              options={MOVEMENT_TYPE_OPTIONS}
              value={filters.movementType ?? ''}
              onChange={(event) => onFiltersChange({ movementType: event.target.value || undefined })}
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

function resolveMovementTypeVariant(movementType: string) {
  return movementTypeVariantMap[movementType as keyof typeof movementTypeVariantMap] ?? 'default';
}
