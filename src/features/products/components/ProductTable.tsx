import { useMemo } from 'react';
import { Package } from 'lucide-react';
import { DataTable } from '@/shared/components/table/DataTable';
import { TableToolbar } from '@/shared/components/table/TableToolbar';
import { BulkActionBar } from '@/shared/components/table/BulkActionBar';
import { FilterChips, type FilterChip } from '@/shared/components/table/FilterChips';
import { Pagination } from '@/shared/components/table/Pagination';
import { StatusBadge } from '@/shared/components/ui/StatusBadge';
import { Button } from '@/shared/components/ui/Button';
import { EmptyState } from '@/shared/components/feedback/EmptyState';
import { SkeletonTable } from '@/shared/components/feedback/Skeleton';
import { ErrorCard } from '@/shared/components/feedback/ErrorCard';
import { formatDate } from '@/shared/utils/formatDate';
import type { ColumnDef, SortState, RowSelectionState } from '@/shared/components/table/types';
import type { PaginatedResponse } from '@/shared/types/api.types';
import type { ProductStatus } from '@/shared/types/enums';
import type { Product, ProductListParams } from '../types/product.types';
import { ProductRowActions } from './ProductRowActions';

interface ProductTableProps {
  data: PaginatedResponse<Product> | undefined;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  filters: ProductListParams;
  onFiltersChange: (updates: Partial<ProductListParams>) => void;
  onReset: () => void;
  onOpenFilters: () => void;
  sort: SortState | undefined;
  onSortChange: (sort: SortState) => void;
  rowSelection: RowSelectionState;
  onRowSelectionChange: (selection: RowSelectionState) => void;
  onBulkPublish: () => void;
  onBulkArchive: () => void;
  onBulkDelete: () => void;
  isBulkPending: boolean;
  onCreateNew: () => void;
}

export function ProductTable({
  data,
  isLoading,
  isError,
  onRetry,
  filters,
  onFiltersChange,
  onReset,
  onOpenFilters,
  sort,
  onSortChange,
  rowSelection,
  onRowSelectionChange,
  onBulkPublish,
  onBulkArchive,
  onBulkDelete,
  isBulkPending,
  onCreateNew,
}: ProductTableProps) {
  const columns = useMemo<ColumnDef<Product>[]>(
    () => [
      { id: 'select' },
      {
        id: 'name',
        header: 'Product',
        enableSorting: true,
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 shrink-0 overflow-hidden rounded-md bg-gray-100">
              {row.original.thumbnailUrl ? (
                <img
                  src={row.original.thumbnailUrl}
                  alt={row.original.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <Package className="h-5 w-5 text-gray-300" />
                </div>
              )}
            </div>
            <div className="min-w-0">
              <p className="truncate font-medium text-gray-900">{row.original.name}</p>
              <p className="truncate text-xs text-gray-400">{row.original.slug}</p>
            </div>
          </div>
        ),
      },
      {
        id: 'brand',
        header: 'Brand',
        cell: ({ row }) => (
          <span className="text-gray-600">{row.original.brand?.name ?? '—'}</span>
        ),
      },
      {
        id: 'status',
        header: 'Status',
        cell: ({ row }) => (
          <StatusBadge type="product" status={row.original.status as ProductStatus} />
        ),
      },
      {
        id: 'variants',
        header: 'Variants',
        cell: ({ row }) => (
          <span className="text-gray-600">{row.original.variantCount ?? 0}</span>
        ),
      },
      {
        id: 'createdAt',
        header: 'Created',
        enableSorting: true,
        cell: ({ row }) => (
          <span className="text-gray-500 text-xs">{formatDate(row.original.createdAt)}</span>
        ),
      },
      {
        id: 'actions',
        header: '',
        className: 'w-12',
        cell: ({ row }) => <ProductRowActions product={row.original} />,
      },
    ],
    [],
  );

  const selectedCount = Object.values(rowSelection).filter(Boolean).length;

  const filterChips = useMemo<FilterChip[]>(() => {
    const chips: FilterChip[] = [];
    if (filters.status) chips.push({ key: 'status', label: 'Status', value: filters.status });
    if (filters.brandId) chips.push({ key: 'brandId', label: 'Brand', value: String(filters.brandId) });
    if (filters.featured) chips.push({ key: 'featured', label: 'Featured', value: filters.featured === 'true' ? 'Yes' : 'No' });
    return chips;
  }, [filters]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <TableToolbar searchPlaceholder="Search products…" />
        <SkeletonTable />
      </div>
    );
  }

  if (isError) {
    return <ErrorCard onRetry={onRetry} />;
  }

  const products = data?.items ?? [];

  return (
    <div className="space-y-3">
      <TableToolbar
        searchValue={filters.keyword ?? ''}
        onSearchChange={(keyword) => onFiltersChange({ keyword, page: 0 })}
        searchPlaceholder="Search products…"
        filters={
          <Button variant="secondary" size="sm" onClick={onOpenFilters}>
            Filters
            {filterChips.length > 0 && (
              <span className="ml-1 rounded-full bg-primary-600 px-1.5 py-0.5 text-xs text-white">
                {filterChips.length}
              </span>
            )}
          </Button>
        }
        actions={
          <Button size="sm" onClick={onCreateNew}>
            + New Product
          </Button>
        }
      />

      {filterChips.length > 0 && (
        <FilterChips
          chips={filterChips}
          onRemove={(key) => onFiltersChange({ [key]: undefined, page: 0 })}
          onReset={onReset}
        />
      )}

      {selectedCount > 0 && (
        <BulkActionBar
          selectedCount={selectedCount}
          actions={
            <>
              <Button
                variant="secondary"
                size="sm"
                onClick={onBulkPublish}
                isLoading={isBulkPending}
              >
                Publish
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={onBulkArchive}
                isLoading={isBulkPending}
              >
                Deactivate
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={onBulkDelete}
                isLoading={isBulkPending}
              >
                Delete
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRowSelectionChange({})}
              >
                Deselect all
              </Button>
            </>
          }
        />
      )}

      <DataTable
        data={products}
        columns={columns}
        getRowId={(row) => String(row.id)}
        sort={sort}
        onSortChange={onSortChange}
        rowSelection={rowSelection}
        onRowSelectionChange={onRowSelectionChange}
        emptyState={
          <EmptyState
            icon={<Package className="h-12 w-12" />}
            title={filterChips.length > 0 ? 'No products match your filters' : 'No products yet'}
            message={
              filterChips.length > 0
                ? 'Try adjusting or resetting your filters.'
                : 'Create your first product to get started.'
            }
            action={
              filterChips.length > 0
                ? { label: 'Clear filters', onClick: onReset }
                : { label: 'New Product', onClick: onCreateNew }
            }
          />
        }
      />

      {data && data.totalItems > 0 && (
        <Pagination
          pagination={data}
          onPageChange={(page) => onFiltersChange({ page })}
          onPageSizeChange={(size) => onFiltersChange({ size, page: 0 })}
        />
      )}
    </div>
  );
}
