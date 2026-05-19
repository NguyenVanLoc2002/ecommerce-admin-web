import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Plus } from 'lucide-react';
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
import { resolveSoftDeleteState } from '@/shared/utils/softDelete';
import { routes } from '@/constants/routes';
import type { ColumnDef, SortState, RowSelectionState } from '@/shared/components/table/types';
import { SoftDeleteState, type PaginatedResponse } from '@/shared/types/api.types';
import type { ProductListItem, ProductListParams } from '../types/product.types';
import type { MultiSelectOption } from '@/shared/components/ui/MultiSelectDropdown';
import { ProductRowActions } from './ProductRowActions';

interface ProductTableProps {
  data: PaginatedResponse<ProductListItem> | undefined;
  isLoading: boolean;
  isSearching: boolean;
  isError: boolean;
  onRetry: () => void;
  filters: ProductListParams;
  onFiltersChange: (updates: Partial<ProductListParams>) => void;
  onReset: () => void;
  onOpenFilters: () => void;
  sort: SortState | undefined;
  onSortChange: (sort: SortState) => void;
  categoryOptions: MultiSelectOption[];
  brandOptions: MultiSelectOption[];
  rowSelection: RowSelectionState;
  onRowSelectionChange: (selection: RowSelectionState) => void;
  onBulkPublish: () => void;
  onBulkArchive: () => void;
  onBulkDelete: () => void;
  pendingBulk: 'publish' | 'deactivate' | 'delete' | null;
  onCreateNew: () => void;
}

export function ProductTable({
  data,
  isLoading,
  isSearching,
  isError,
  onRetry,
  filters,
  onFiltersChange,
  onReset,
  onOpenFilters,
  sort,
  onSortChange,
  categoryOptions,
  brandOptions,
  rowSelection,
  onRowSelectionChange,
  onBulkPublish,
  onBulkArchive,
  onBulkDelete,
  pendingBulk,
  onCreateNew,
}: ProductTableProps) {
  const navigate = useNavigate();
  const isBulkPending = pendingBulk !== null;

  const columns = useMemo<ColumnDef<ProductListItem>[]>(
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
              <button
                type="button"
                onClick={() => navigate(routes.products.edit(row.original.id))}
                className="truncate text-left text-sm font-semibold text-gray-900 hover:text-primary-700 hover:underline"
              >
                {row.original.name}
              </button>
              <p className="truncate font-mono text-xs text-gray-400">{row.original.slug}</p>
            </div>
          </div>
        ),
      },
      {
        id: 'brand',
        header: 'Brand',
        cell: ({ row }) => (
          <span className="text-gray-600">{row.original.brandName || '-'}</span>
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
          <StatusBadge type="product" status={row.original.status} />
        ),
      },
      {
        id: 'variants',
        header: 'Variants',
        cell: ({ row }) => (
          <span className="text-gray-600">
            {row.original.variantCount ?? row.original.activeVariantCount ?? 0}
          </span>
        ),
      },
      {
        id: 'createdAt',
        header: 'Created',
        enableSorting: true,
        cell: ({ row }) => (
          <span className="text-xs text-gray-500">{formatDate(row.original.createdAt)}</span>
        ),
      },
      {
        id: 'actions',
        header: '',
        className: 'w-12',
        cell: ({ row }) => <ProductRowActions product={row.original} />,
      },
    ],
    [filters.deletedState, navigate],
  );

  const selectedCount = Object.values(rowSelection).filter(Boolean).length;
  const categoryLabelById = useMemo(
    () => new Map(categoryOptions.map((option) => [String(option.value), option.label])),
    [categoryOptions],
  );
  const brandLabelById = useMemo(
    () => new Map(brandOptions.map((option) => [String(option.value), option.label])),
    [brandOptions],
  );

  const filterChips = useMemo<FilterChip[]>(() => {
    const chips: FilterChip[] = [];

    if (filters.categoryId) {
      chips.push({
        key: 'categoryId',
        label: 'Category',
        value: categoryLabelById.get(String(filters.categoryId)) ?? String(filters.categoryId),
      });
    }

    if (filters.status) {
      chips.push({ key: 'status', label: 'Status', value: filters.status });
    }

    if (filters.brandId) {
      chips.push({
        key: 'brandId',
        label: 'Brand',
        value: brandLabelById.get(String(filters.brandId)) ?? String(filters.brandId),
      });
    }

    if (typeof filters.featured === 'boolean') {
      chips.push({
        key: 'featured',
        label: 'Featured',
        value: filters.featured ? 'Yes' : 'No',
      });
    }

    if (typeof filters.minPrice === 'number') {
      chips.push({
        key: 'minPrice',
        label: 'Min price',
        value: String(filters.minPrice),
      });
    }

    if (typeof filters.maxPrice === 'number') {
      chips.push({
        key: 'maxPrice',
        label: 'Max price',
        value: String(filters.maxPrice),
      });
    }

    if (filters.deletedState && filters.deletedState !== SoftDeleteState.ACTIVE) {
      chips.push({
        key: 'deletedState',
        label: 'Record',
        value: filters.deletedState === SoftDeleteState.DELETED ? 'Deleted' : 'All',
      });
    }

    return chips;
  }, [brandLabelById, categoryLabelById, filters]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <TableToolbar searchPlaceholder="Search products..." />
        <SkeletonTable />
      </div>
    );
  }

  if (isError) {
    return <ErrorCard onRetry={onRetry} />;
  }

  const products = data?.items ?? [];

  return (
    <div className="min-w-0 space-y-3">
      <TableToolbar
        searchValue={filters.keyword ?? ''}
        onSearchChange={(keyword) => onFiltersChange({ keyword, page: 0 })}
        searchPlaceholder="Search products..."
        isSearching={isSearching}
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
          <Button size="md" onClick={onCreateNew} leftIcon={<Plus className="h-4 w-4" />}>
            New Product
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
                isLoading={pendingBulk === 'publish'}
                disabled={isBulkPending}
              >
                Publish
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={onBulkArchive}
                isLoading={pendingBulk === 'deactivate'}
                disabled={isBulkPending}
              >
                Deactivate
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={onBulkDelete}
                isLoading={pendingBulk === 'delete'}
                disabled={isBulkPending}
              >
                Delete
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRowSelectionChange({})}
                disabled={isBulkPending}
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
        getRowId={(row) => row.id}
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
                : filters.deletedState === SoftDeleteState.DELETED
                  ? 'Deleted products will appear here.'
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
