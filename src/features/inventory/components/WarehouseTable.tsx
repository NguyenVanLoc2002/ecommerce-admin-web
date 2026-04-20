import { useMemo } from 'react';
import { Plus, Warehouse as WarehouseIcon } from 'lucide-react';
import { DataTable } from '@/shared/components/table/DataTable';
import { TableToolbar } from '@/shared/components/table/TableToolbar';
import { Pagination } from '@/shared/components/table/Pagination';
import { StatusBadge } from '@/shared/components/ui/StatusBadge';
import { Button } from '@/shared/components/ui/Button';
import { Select } from '@/shared/components/ui/Select';
import { SkeletonTable } from '@/shared/components/feedback/Skeleton';
import { ErrorCard } from '@/shared/components/feedback/ErrorCard';
import { EmptyState } from '@/shared/components/feedback/EmptyState';
import { formatDate } from '@/shared/utils/formatDate';
import type { ColumnDef, SortState } from '@/shared/components/table/types';
import type { PaginatedResponse } from '@/shared/types/api.types';
import type { VariantStatus } from '@/shared/types/enums';
import type { Warehouse, WarehouseListParams } from '../types/inventory.types';
import { WarehouseRowActions } from './WarehouseRowActions';

const STATUS_FILTER_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
];

interface WarehouseTableProps {
  data: PaginatedResponse<Warehouse> | undefined;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  filters: WarehouseListParams;
  onFiltersChange: (updates: Partial<WarehouseListParams>) => void;
  sort: SortState | undefined;
  onSortChange: (sort: SortState) => void;
  onEdit: (warehouse: Warehouse) => void;
  onCreateNew: () => void;
}

export function WarehouseTable({
  data,
  isLoading,
  isError,
  onRetry,
  filters,
  onFiltersChange,
  sort,
  onSortChange,
  onEdit,
  onCreateNew,
}: WarehouseTableProps) {
  const columns = useMemo<ColumnDef<Warehouse>[]>(
    () => [
      {
        id: 'name',
        header: 'Name',
        enableSorting: true,
        cell: ({ row }) => (
          <p className="font-medium text-gray-900">{row.original.name}</p>
        ),
      },
      {
        id: 'code',
        header: 'Code',
        cell: ({ row }) => (
          <span className="font-mono text-sm text-gray-700">{row.original.code}</span>
        ),
      },
      {
        id: 'location',
        header: 'Location',
        cell: ({ row }) => (
          <span className="text-gray-500 text-sm">
            {row.original.location ?? '—'}
          </span>
        ),
      },
      {
        id: 'status',
        header: 'Status',
        cell: ({ row }) => (
          <StatusBadge type="variant" status={row.original.status as VariantStatus} />
        ),
      },
      {
        id: 'createdAt',
        header: 'Created',
        enableSorting: true,
        cell: ({ row }) => (
          <span className="text-gray-500 text-sm">{formatDate(row.original.createdAt)}</span>
        ),
      },
      {
        id: 'actions',
        header: '',
        className: 'w-12',
        cell: ({ row }) => (
          <WarehouseRowActions warehouse={row.original} onEdit={onEdit} />
        ),
      },
    ],
    [onEdit],
  );

  if (isLoading) return <SkeletonTable rows={6} />;
  if (isError) return <ErrorCard onRetry={onRetry} />;

  return (
    <div className="space-y-4">
      <TableToolbar
        searchValue={filters.keyword ?? ''}
        onSearchChange={(keyword) => onFiltersChange({ keyword: keyword || undefined })}
        searchPlaceholder="Search warehouses…"
        filters={
          <Select
            options={STATUS_FILTER_OPTIONS}
            value={filters.status ?? ''}
            onChange={(e) => onFiltersChange({ status: e.target.value || undefined })}
            className="h-9 w-36 text-sm"
          />
        }
        actions={
          <Button size="sm" onClick={onCreateNew} leftIcon={<Plus className="h-4 w-4" />}>
            Add Warehouse
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
            icon={<WarehouseIcon className="h-10 w-10" />}
            title="No warehouses yet"
            message="Add your first warehouse to start tracking inventory."
            action={{ label: 'Add Warehouse', onClick: onCreateNew }}
          />
        }
      />

      {data && data.totalPages > 1 && (
        <Pagination
          pagination={data}
          onPageChange={(page) => onFiltersChange({ page } as Partial<WarehouseListParams>)}
          onPageSizeChange={(size) => onFiltersChange({ size } as Partial<WarehouseListParams>)}
        />
      )}
    </div>
  );
}
