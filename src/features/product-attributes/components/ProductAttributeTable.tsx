import { useMemo } from 'react';
import { ListFilter, Plus } from 'lucide-react';
import { DataTable } from '@/shared/components/table/DataTable';
import { TableToolbar } from '@/shared/components/table/TableToolbar';
import { Pagination } from '@/shared/components/table/Pagination';
import { EmptyState } from '@/shared/components/feedback/EmptyState';
import { ErrorCard } from '@/shared/components/feedback/ErrorCard';
import { SkeletonTable } from '@/shared/components/feedback/Skeleton';
import { Button } from '@/shared/components/ui/Button';
import { SoftDeleteFilter } from '@/shared/components/ui/SoftDeleteFilter';
import { Select } from '@/shared/components/ui/Select';
import { StatusBadge } from '@/shared/components/ui/StatusBadge';
import { formatDate } from '@/shared/utils/formatDate';
import { resolveSoftDeleteState } from '@/shared/utils/softDelete';
import type { ColumnDef, SortState } from '@/shared/components/table/types';
import { SoftDeleteState, type PaginatedResponse } from '@/shared/types/api.types';
import type { ProductAttribute, ProductAttributeListParams } from '../types/productAttribute.types';
import { ProductAttributeType } from '../types/productAttribute.types';
import { ProductAttributeRowActions } from './ProductAttributeRowActions';

const TYPE_FILTER_OPTIONS = [
  { value: '', label: 'All types' },
  { value: ProductAttributeType.VARIANT, label: 'Variant' },
  { value: ProductAttributeType.DESCRIPTIVE, label: 'Descriptive' },
];

interface ProductAttributeTableProps {
  data: PaginatedResponse<ProductAttribute> | undefined;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  filters: ProductAttributeListParams;
  onFiltersChange: (updates: Partial<ProductAttributeListParams>) => void;
  sort: SortState | undefined;
  onSortChange: (sort: SortState) => void;
  onEdit: (attribute: ProductAttribute) => void;
  onCreateNew: () => void;
}

function AttributeTypeBadge({ type }: { type: ProductAttribute['type'] }) {
  const classes =
    type === ProductAttributeType.VARIANT
      ? 'border-primary-200 bg-primary-50 text-primary-700'
      : 'border-gray-200 bg-gray-50 text-gray-700';

  return (
    <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${classes}`}>
      {type}
    </span>
  );
}

export function ProductAttributeTable({
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
}: ProductAttributeTableProps) {
  const columns = useMemo<ColumnDef<ProductAttribute>[]>(
    () => [
      {
        id: 'name',
        header: 'Name',
        enableSorting: true,
        cell: ({ row }) => (
          <p className="text-sm font-semibold text-gray-900">{row.original.name}</p>
        ),
      },
      {
        id: 'code',
        header: 'Code',
        enableSorting: true,
        cell: ({ row }) => (
          <span className="font-mono text-xs text-gray-600">{row.original.code}</span>
        ),
      },
      {
        id: 'type',
        header: 'Type',
        enableSorting: true,
        cell: ({ row }) => <AttributeTypeBadge type={row.original.type} />,
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
        id: 'values',
        header: 'Values count',
        headerClassName: 'text-right',
        className: 'text-right',
        cell: ({ row }) => (
          <span className="tabular-nums text-sm font-medium text-gray-700">
            {row.original.values.length}
          </span>
        ),
      },
      {
        id: 'updatedAt',
        header: 'Updated at',
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-xs text-gray-500">
            {formatDate(row.original.updatedAt)}
          </span>
        ),
      },
      {
        id: 'actions',
        header: '',
        className: 'w-12',
        cell: ({ row }) => (
          <ProductAttributeRowActions attribute={row.original} onEdit={onEdit} />
        ),
      },
    ],
    [filters.deletedState, onEdit],
  );

  if (isLoading) {
    return <SkeletonTable rows={6} />;
  }

  if (isError) {
    return <ErrorCard onRetry={onRetry} />;
  }

  const items = data?.items ?? [];
  const hasActiveFilters = Boolean(
    filters.keyword ||
      filters.type ||
      filters.deletedState === SoftDeleteState.DELETED ||
      filters.deletedState === SoftDeleteState.ALL,
  );

  return (
    <div className="space-y-4">
      <TableToolbar
        searchValue={filters.keyword ?? ''}
        onSearchChange={(keyword) => onFiltersChange({ keyword: keyword || undefined })}
        searchPlaceholder="Search name or code…"
        filters={
          <>
            <Select
              options={TYPE_FILTER_OPTIONS}
              value={filters.type ?? ''}
              onChange={(event) =>
                onFiltersChange({
                  type: (event.target.value || undefined) as ProductAttributeListParams['type'],
                })
              }
              className="h-9 w-40 text-sm"
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
            Add attribute
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
          hasActiveFilters ? (
            <EmptyState
              icon={<ListFilter className="h-10 w-10" />}
              title={
                filters.deletedState === SoftDeleteState.DELETED
                  ? 'No deleted product attributes found'
                  : filters.deletedState === SoftDeleteState.ACTIVE
                    ? 'No active product attributes found'
                    : 'No product attributes found'
              }
              message="Try adjusting your search or type filter."
            />
          ) : (
            <EmptyState
              icon={<ListFilter className="h-10 w-10" />}
              title="No product attributes yet"
              message="Create Color, Size, or Material to start."
              action={{ label: 'Add attribute', onClick: onCreateNew }}
            />
          )
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
