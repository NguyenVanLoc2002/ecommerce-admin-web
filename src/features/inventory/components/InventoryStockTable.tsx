import { useMemo } from 'react';
import { Download, SlidersHorizontal, PackageSearch } from 'lucide-react';
import { DataTable } from '@/shared/components/table/DataTable';
import { TableToolbar } from '@/shared/components/table/TableToolbar';
import { Pagination } from '@/shared/components/table/Pagination';
import { Button } from '@/shared/components/ui/Button';
import { Select } from '@/shared/components/ui/Select';
import { SkeletonTable } from '@/shared/components/feedback/Skeleton';
import { ErrorCard } from '@/shared/components/feedback/ErrorCard';
import { EmptyState } from '@/shared/components/feedback/EmptyState';
import { formatDateTime } from '@/shared/utils/formatDate';
import { cn } from '@/shared/utils/cn';
import type { ColumnDef } from '@/shared/components/table/types';
import type { PaginatedResponse } from '@/shared/types/api.types';
import type { InventoryStock, InventoryStockParams, Warehouse } from '../types/inventory.types';

interface InventoryStockTableProps {
  data: PaginatedResponse<InventoryStock> | undefined;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  filters: InventoryStockParams;
  onFiltersChange: (updates: Partial<InventoryStockParams>) => void;
  warehouses: Warehouse[];
  onImport: (stock: InventoryStock) => void;
  onAdjust: (stock: InventoryStock) => void;
  onImportNew: () => void;
}

function AvailabilityCell({ value }: { value: number }) {
  return (
    <span
      className={cn(
        'font-semibold tabular-nums',
        value === 0 ? 'text-danger-600' : value <= 5 ? 'text-warning-600' : 'text-success-700',
      )}
    >
      {value}
    </span>
  );
}

export function InventoryStockTable({
  data,
  isLoading,
  isError,
  onRetry,
  filters,
  onFiltersChange,
  warehouses,
  onImport,
  onAdjust,
  onImportNew,
}: InventoryStockTableProps) {
  const warehouseOptions = [
    { value: '', label: 'All warehouses' },
    ...warehouses.map((w) => ({ value: String(w.id), label: w.name })),
  ];

  const columns = useMemo<ColumnDef<InventoryStock>[]>(
    () => [
      {
        id: 'product',
        header: 'Product / Variant',
        cell: ({ row }) => (
          <div>
            <p className="font-medium text-gray-900 text-sm">{row.original.productName}</p>
            <p className="text-xs text-gray-500">
              <span className="font-mono">{row.original.sku}</span>
              {' — '}
              {row.original.variantName}
            </p>
          </div>
        ),
      },
      {
        id: 'warehouse',
        header: 'Warehouse',
        cell: ({ row }) => (
          <span className="text-sm text-gray-700">{row.original.warehouseName}</span>
        ),
      },
      {
        id: 'onHand',
        header: 'On Hand',
        headerClassName: 'text-right',
        className: 'text-right tabular-nums',
        cell: ({ row }) => (
          <span className="font-medium text-gray-800">{row.original.onHand}</span>
        ),
      },
      {
        id: 'reserved',
        header: 'Reserved',
        headerClassName: 'text-right',
        className: 'text-right tabular-nums',
        cell: ({ row }) => (
          <span className="text-gray-500">{row.original.reserved}</span>
        ),
      },
      {
        id: 'available',
        header: 'Available',
        headerClassName: 'text-right',
        className: 'text-right',
        cell: ({ row }) => <AvailabilityCell value={row.original.available} />,
      },
      {
        id: 'updatedAt',
        header: 'Updated',
        cell: ({ row }) => (
          <span className="text-xs text-gray-400">{formatDateTime(row.original.updatedAt)}</span>
        ),
      },
      {
        id: 'actions',
        header: '',
        className: 'w-40',
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onImport(row.original)}
              leftIcon={<Download className="h-3.5 w-3.5" />}
            >
              Import
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onAdjust(row.original)}
              leftIcon={<SlidersHorizontal className="h-3.5 w-3.5" />}
            >
              Adjust
            </Button>
          </div>
        ),
      },
    ],
    [onImport, onAdjust],
  );

  if (isLoading) return <SkeletonTable rows={8} />;
  if (isError) return <ErrorCard onRetry={onRetry} />;

  return (
    <div className="space-y-4">
      <TableToolbar
        searchValue={filters.keyword ?? ''}
        onSearchChange={(keyword) => onFiltersChange({ keyword: keyword || undefined })}
        searchPlaceholder="Search by SKU or product name…"
        filters={
          <Select
            options={warehouseOptions}
            value={String(filters.warehouseId ?? '')}
            onChange={(e) =>
              onFiltersChange({ warehouseId: e.target.value ? Number(e.target.value) : undefined })
            }
            className="h-9 w-44 text-sm"
          />
        }
        actions={
          <Button size="sm" onClick={onImportNew} leftIcon={<Download className="h-4 w-4" />}>
            Import Stock
          </Button>
        }
      />

      <DataTable
        data={data?.items ?? []}
        columns={columns}
        getRowId={(row) => String(row.id)}
        emptyState={
          <EmptyState
            icon={<PackageSearch className="h-10 w-10" />}
            title="No stock records found"
            message="Import stock to start tracking inventory levels."
            action={{ label: 'Import Stock', onClick: onImportNew }}
          />
        }
      />

      {data && data.totalPages > 1 && (
        <Pagination
          pagination={data}
          onPageChange={(page) => onFiltersChange({ page } as Partial<InventoryStockParams>)}
          onPageSizeChange={(size) => onFiltersChange({ size } as Partial<InventoryStockParams>)}
        />
      )}
    </div>
  );
}
