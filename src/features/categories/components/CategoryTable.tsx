import { useMemo } from 'react';
import { Plus, Tag } from 'lucide-react';
import { DataTable } from '@/shared/components/table/DataTable';
import { TableToolbar } from '@/shared/components/table/TableToolbar';
import { Pagination } from '@/shared/components/table/Pagination';
import { SoftDeleteFilter } from '@/shared/components/ui/SoftDeleteFilter';
import { StatusBadge } from '@/shared/components/ui/StatusBadge';
import { Button } from '@/shared/components/ui/Button';
import { Select } from '@/shared/components/ui/Select';
import { SkeletonTable } from '@/shared/components/feedback/Skeleton';
import { ErrorCard } from '@/shared/components/feedback/ErrorCard';
import { EmptyState } from '@/shared/components/feedback/EmptyState';
import { formatDate } from '@/shared/utils/formatDate';
import { resolveSoftDeleteState } from '@/shared/utils/softDelete';
import type { ColumnDef, SortState } from '@/shared/components/table/types';
import { SoftDeleteState, type PaginatedResponse } from '@/shared/types/api.types';
import type { EntityStatus } from '@/shared/types/enums';
import type { Category, CategoryListParams } from '../types/category.types';
import { CategoryRowActions } from './CategoryRowActions';

const STATUS_FILTER_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
];

function ProductCountMeter({ count, max }: { count: number; max: number }) {
  const ratio = max > 0 ? Math.min(1, count / max) : 0;
  return (
    <div className="flex flex-col items-end gap-1">
      <span className="text-sm font-semibold tabular-nums text-gray-700">{count}</span>
      <div className="h-1 w-16 overflow-hidden rounded-full bg-gray-100" aria-hidden>
        <div
          className="h-full rounded-full bg-primary-400"
          style={{ width: `${ratio * 100}%` }}
        />
      </div>
    </div>
  );
}

interface CategoryTableProps {
  data: PaginatedResponse<Category> | undefined;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  filters: CategoryListParams;
  onFiltersChange: (updates: Partial<CategoryListParams>) => void;
  sort: SortState | undefined;
  onSortChange: (sort: SortState) => void;
  onEdit: (category: Category) => void;
  onCreateNew: () => void;
}

export function CategoryTable({
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
}: CategoryTableProps) {
  const items = data?.items ?? [];
  const maxProductCount = useMemo(
    () => items.reduce((acc, c) => Math.max(acc, c.productCount), 0),
    [items],
  );

  const columns = useMemo<ColumnDef<Category>[]>(
    () => [
      {
        id: 'name',
        header: 'Name',
        enableSorting: true,
        cell: ({ row }) => (
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-gray-900">{row.original.name}</p>
            <p className="truncate font-mono text-xs text-gray-400">{row.original.slug}</p>
          </div>
        ),
      },
      {
        id: 'recordStatus',
        header: 'Record Status',
        cell: ({ row }) => (
          <StatusBadge
            type="soft-delete"
            status={resolveSoftDeleteState(row.original, filters.deletedState)}
          />
        ),
      },
      {
        id: 'status',
        header: 'Status',
        cell: ({ row }) => (
          <StatusBadge type="entity" status={row.original.status as EntityStatus} />
        ),
      },
      {
        id: 'productCount',
        header: 'Products',
        headerClassName: 'text-right',
        className: 'text-right',
        cell: ({ row }) => (
          <ProductCountMeter count={row.original.productCount} max={maxProductCount} />
        ),
      },
      {
        id: 'createdAt',
        header: 'Created',
        enableSorting: true,
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-xs text-gray-500">{formatDate(row.original.createdAt)}</span>
        ),
      },
      {
        id: 'actions',
        header: '',
        className: 'w-12',
        cell: ({ row }) => (
          <CategoryRowActions category={row.original} onEdit={onEdit} />
        ),
      },
    ],
    [filters.deletedState, onEdit, maxProductCount],
  );

  if (isLoading) return <SkeletonTable rows={6} />;
  if (isError) return <ErrorCard onRetry={onRetry} />;

  return (
    <div className="space-y-4">
      <TableToolbar
        searchValue={filters.name ?? ''}
        onSearchChange={(name) => onFiltersChange({ name: name || undefined })}
        searchPlaceholder="Search categories…"
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
        actions={
          <Button size="md" onClick={onCreateNew} leftIcon={<Plus className="h-4 w-4" />}>
            Add Category
          </Button>
        }
      />

      <DataTable
        data={items}
        columns={columns}
        getRowId={(row) => String(row.id)}
        sort={sort}
        onSortChange={onSortChange}
        emptyState={
          <EmptyState
            icon={<Tag className="h-10 w-10" />}
            title={
              filters.deletedState === SoftDeleteState.DELETED
                ? 'No deleted categories'
                : filters.deletedState === SoftDeleteState.ALL
                  ? 'No categories yet'
                  : 'No active categories'
            }
            message={
              filters.deletedState === SoftDeleteState.DELETED
                ? 'Deleted categories will appear here.'
                : 'Create your first category to organize your product catalog.'
            }
            action={{ label: 'Add Category', onClick: onCreateNew }}
          />
        }
      />

      {data && data.totalPages > 1 && (
        <Pagination
          pagination={data}
          onPageChange={(page) => onFiltersChange({ page } as Partial<CategoryListParams>)}
          onPageSizeChange={(size) => onFiltersChange({ size } as Partial<CategoryListParams>)}
        />
      )}
    </div>
  );
}
