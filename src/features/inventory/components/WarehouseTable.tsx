import { useMemo } from 'react';
import { Plus, Warehouse as WarehouseIcon } from 'lucide-react';
import { DataTable } from '@/shared/components/table/DataTable';
import { TableToolbar } from '@/shared/components/table/TableToolbar';
import { SoftDeleteFilter } from '@/shared/components/ui/SoftDeleteFilter';
import { StatusBadge } from '@/shared/components/ui/StatusBadge';
import { Button } from '@/shared/components/ui/Button';
import { Select } from '@/shared/components/ui/Select';
import { SkeletonTable } from '@/shared/components/feedback/Skeleton';
import { ErrorCard } from '@/shared/components/feedback/ErrorCard';
import { EmptyState } from '@/shared/components/feedback/EmptyState';
import { formatDate } from '@/shared/utils/formatDate';
import type { ColumnDef } from '@/shared/components/table/types';
import { SoftDeleteState } from '@/shared/types/api.types';
import type { Warehouse, WarehouseListParams } from '../types/inventory.types';
import { WarehouseRowActions } from './WarehouseRowActions';

const STATUS_FILTER_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
];

interface WarehouseTableProps {
  data: Warehouse[] | undefined;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  filters: WarehouseListParams;
  onFiltersChange: (updates: Partial<WarehouseListParams>) => void;
  canWrite: boolean;
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
  canWrite,
  onEdit,
  onCreateNew,
}: WarehouseTableProps) {
  const columns = useMemo<ColumnDef<Warehouse>[]>(
    () => [
      {
        id: 'name',
        header: 'Name',
        cell: ({ row }) => (
          <p className="truncate text-sm font-semibold text-gray-900">{row.original.name}</p>
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
          <span className="text-sm text-gray-500">
            {row.original.location ?? 'Not set'}
          </span>
        ),
      },
      {
        id: 'status',
        header: 'Status',
        cell: ({ row }) => (
          <StatusBadge type="entity" status={row.original.status} />
        ),
      },
      {
        id: 'createdAt',
        header: 'Created',
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-xs text-gray-500">
            {formatDate(row.original.createdAt)}
          </span>
        ),
      },
      {
        id: 'actions',
        header: '',
        className: 'w-12',
        cell: ({ row }) => (
          filters.deletedState === SoftDeleteState.DELETED
            ? null
            : <WarehouseRowActions warehouse={row.original} onEdit={onEdit} />
        ),
      },
    ],
    [filters.deletedState, onEdit],
  );

  if (isLoading) return <SkeletonTable rows={6} />;
  if (isError) return <ErrorCard onRetry={onRetry} />;

  return (
    <div className="space-y-4">
      <TableToolbar
        filters={
          <>
            <Select
              options={STATUS_FILTER_OPTIONS}
              value={filters.status ?? ''}
              onChange={(e) => onFiltersChange({ status: e.target.value || undefined })}
              className="h-9 w-36 text-sm"
            />
            <SoftDeleteFilter
              value={filters.deletedState ?? SoftDeleteState.ACTIVE}
              onChange={(deletedState) => onFiltersChange({ deletedState })}
              className="h-9 w-32 text-sm"
            />
          </>
        }
        actions={canWrite ? (
          <Button size="sm" onClick={onCreateNew} leftIcon={<Plus className="h-4 w-4" />}>
            Add Warehouse
          </Button>
        ) : undefined}
      />

      <DataTable
        data={data ?? []}
        columns={columns}
        getRowId={(row) => String(row.id)}
        emptyState={
          <EmptyState
            icon={<WarehouseIcon className="h-10 w-10" />}
            title={
              filters.deletedState === SoftDeleteState.DELETED
                ? 'No deleted warehouses'
                : filters.deletedState === SoftDeleteState.ALL
                  ? 'No warehouses yet'
                  : 'No active warehouses'
            }
            message={
              filters.deletedState === SoftDeleteState.DELETED
                ? 'Deleted warehouses will appear here.'
                : 'Add your first warehouse to start tracking inventory.'
            }
            action={canWrite ? { label: 'Add Warehouse', onClick: onCreateNew } : undefined}
          />
        }
      />
    </div>
  );
}
