import { useMemo } from 'react';
import { Plus, Tag } from 'lucide-react';
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
import type { Category, CategoryListParams } from '../types/category.types';
import { CategoryRowActions } from './CategoryRowActions';

const STATUS_FILTER_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
];

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
  const columns = useMemo<ColumnDef<Category>[]>(
    () => [
      {
        id: 'name',
        header: 'Name',
        enableSorting: true,
        cell: ({ row }) => (
          <div>
            <p className="font-medium text-gray-900">{row.original.name}</p>
            <p className="text-xs text-gray-400 font-mono">{row.original.slug}</p>
          </div>
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
        id: 'productCount',
        header: 'Products',
        cell: ({ row }) => (
          <span className="text-gray-600">{row.original.productCount}</span>
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
          <CategoryRowActions category={row.original} onEdit={onEdit} />
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
        searchPlaceholder="Search categories…"
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
            Add Category
          </Button>
        }
      />

      <DataTable
        data={data?.content ?? []}
        columns={columns}
        getRowId={(row) => String(row.id)}
        sort={sort}
        onSortChange={onSortChange}
        emptyState={
          <EmptyState
            icon={<Tag className="h-10 w-10" />}
            title="No categories yet"
            message="Create your first category to organise your product catalog."
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
