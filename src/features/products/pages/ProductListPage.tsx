import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw } from 'lucide-react';
import { AdminLayout } from '@/shared/components/layout/AdminLayout';
import { PageHeader } from '@/shared/components/layout/PageHeader';
import { Button } from '@/shared/components/ui/Button';
import { Tooltip } from '@/shared/components/ui/Tooltip';
import { useConfirmDialog } from '@/shared/hooks/useConfirmDialog';
import { useTableFilters } from '@/shared/hooks/useTableFilters';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { toast } from '@/shared/stores/uiStore';
import { usePermission } from '@/constants/permissions';
import { routes } from '@/constants/routes';
import { SoftDeleteState } from '@/shared/types/api.types';
import { buildSortParam, parseSortParam } from '@/shared/utils/sort';
import type { SortState, RowSelectionState } from '@/shared/components/table/types';
import type { MultiSelectOption } from '@/shared/components/ui/MultiSelectDropdown';
import { useProducts } from '../hooks/useProducts';
import { useBulkUpdateProductStatus, useBulkDeleteProducts } from '../hooks/useBulkProducts';
import { useBrandOptions, useCategoryOptions } from '../hooks/useCatalogOptions';
import { useReindexProductSearch } from '../hooks/useReindexProductSearch';
import { ProductTable } from '../components/ProductTable';
import { ProductFiltersDrawer } from '../components/ProductFiltersDrawer';
import type { ProductListParams } from '../types/product.types';
import { resolveProductListQuery } from '../utils/productListQuery';

const DEFAULT_FILTERS: ProductListParams = {
  page: 0,
  size: 20,
  sort: 'createdAt,desc',
  keyword: undefined,
  status: undefined,
  categoryId: undefined,
  brandId: undefined,
  minPrice: undefined,
  maxPrice: undefined,
  featured: undefined,
  deletedState: SoftDeleteState.ACTIVE,
};

type BulkAction = 'publish' | 'deactivate' | 'delete';

export function ProductListPage() {
  const navigate = useNavigate();
  const { confirm } = useConfirmDialog();
  const canReindex = usePermission('products', 'maintenance');
  const [filters, setFilters, resetFilters] = useTableFilters<ProductListParams>(DEFAULT_FILTERS, {
    booleanKeys: ['featured'],
    numberKeys: ['minPrice', 'maxPrice'],
  });
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [pendingBulk, setPendingBulk] = useState<BulkAction | null>(null);

  const rawKeyword = filters.keyword ?? '';
  const debouncedKeyword = useDebounce(rawKeyword, 300);
  const resolvedQuery = resolveProductListQuery(filters, debouncedKeyword);
  const sort = parseSortParam(resolvedQuery.sort);
  const trimmedKeyword = rawKeyword.trim();
  const isKeywordDebouncing = trimmedKeyword !== (resolvedQuery.keyword ?? '');

  const { data, isLoading, isFetching, isError, refetch } = useProducts(resolvedQuery.request);
  const bulkUpdateStatus = useBulkUpdateProductStatus();
  const bulkDelete = useBulkDeleteProducts();
  const reindexProductSearch = useReindexProductSearch();
  const { data: categoriesData } = useCategoryOptions();
  const { data: brandsData } = useBrandOptions();

  const selectedIds = Object.entries(rowSelection)
    .filter(([, value]) => value)
    .map(([id]) => id);

  const categoryOptions: MultiSelectOption[] = (categoriesData ?? []).map((category) => ({
    value: category.id,
    label: category.name,
  }));
  const brandOptions: MultiSelectOption[] = (brandsData ?? []).map((brand) => ({
    value: brand.id,
    label: brand.name,
  }));

  const handleSortChange = (newSort: SortState) => {
    setFilters({ sort: buildSortParam(newSort), page: 0 });
  };

  const handleBulkPublish = async () => {
    if (selectedIds.length === 0) return;
    const ok = await confirm({
      title: `Publish ${selectedIds.length} product${selectedIds.length > 1 ? 's' : ''}?`,
      description: 'Selected products will be visible to customers.',
      confirmLabel: 'Publish',
    });
    if (!ok) return;

    setPendingBulk('publish');
    try {
      const result = await bulkUpdateStatus.mutateAsync({ ids: selectedIds, status: 'PUBLISHED' });
      setRowSelection({});
      if (result.failed > 0) {
        toast.warning(`${result.succeeded} published, ${result.failed} failed.`);
      } else {
        toast.success(`${result.succeeded} product${result.succeeded > 1 ? 's' : ''} published.`);
      }
    } finally {
      setPendingBulk(null);
    }
  };

  const handleBulkDeactivate = async () => {
    if (selectedIds.length === 0) return;
    const ok = await confirm({
      title: `Deactivate ${selectedIds.length} product${selectedIds.length > 1 ? 's' : ''}?`,
      description: 'Deactivated products will no longer be visible to customers.',
      confirmLabel: 'Deactivate',
    });
    if (!ok) return;

    setPendingBulk('deactivate');
    try {
      const result = await bulkUpdateStatus.mutateAsync({ ids: selectedIds, status: 'INACTIVE' });
      setRowSelection({});
      if (result.failed > 0) {
        toast.warning(`${result.succeeded} deactivated, ${result.failed} failed.`);
      } else {
        toast.success(`${result.succeeded} product${result.succeeded > 1 ? 's' : ''} deactivated.`);
      }
    } finally {
      setPendingBulk(null);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    const ok = await confirm({
      title: `Delete ${selectedIds.length} product${selectedIds.length > 1 ? 's' : ''}?`,
      description: 'This action cannot be undone.',
      confirmLabel: 'Delete',
      variant: 'destructive',
    });
    if (!ok) return;

    setPendingBulk('delete');
    try {
      const result = await bulkDelete.mutateAsync(selectedIds);
      setRowSelection({});
      if (result.failed > 0) {
        toast.warning(`${result.succeeded} deleted successfully, ${result.failed} failed.`);
      } else {
        toast.success(
          result.succeeded === 1
            ? 'Product deleted successfully.'
            : 'Products deleted successfully.',
        );
      }
    } finally {
      setPendingBulk(null);
    }
  };

  const handleReindexSearch = async () => {
    if (!canReindex) {
      return;
    }

    const ok = await confirm({
      title: 'Rebuild product search index?',
      description:
        'This refreshes the internal FULLTEXT search field for active products.',
      confirmLabel: 'Reindex',
    });
    if (!ok) return;

    try {
      const result = await reindexProductSearch.mutateAsync();
      toast.success(`Search index rebuilt for ${result.totalProcessed} products.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to rebuild search index.');
    }
  };

  return (
    <AdminLayout>
      <div className="min-w-0 space-y-6 p-6">
        <PageHeader
          title="Products"
          description="Manage your product catalog."
          actions={
            <>
              {canReindex ? (
                <Button
                  variant="secondary"
                  onClick={() => void handleReindexSearch()}
                  leftIcon={<RefreshCw className="h-4 w-4" />}
                  isLoading={reindexProductSearch.isPending}
                >
                  Reindex Search
                </Button>
              ) : (
                <Tooltip content="Requires Admin role">
                  <span>
                    <Button
                      variant="secondary"
                      disabled
                      leftIcon={<RefreshCw className="h-4 w-4" />}
                    >
                      Reindex Search
                    </Button>
                  </span>
                </Tooltip>
              )}
            </>
          }
        />

        <ProductTable
          data={data}
          isLoading={isLoading}
          isSearching={isKeywordDebouncing || (isFetching && trimmedKeyword.length > 0)}
          isError={isError}
          onRetry={() => void refetch()}
          filters={filters}
          onFiltersChange={setFilters}
          onReset={resetFilters}
          onOpenFilters={() => setFiltersOpen(true)}
          sort={sort}
          onSortChange={handleSortChange}
          categoryOptions={categoryOptions}
          brandOptions={brandOptions}
          rowSelection={rowSelection}
          onRowSelectionChange={setRowSelection}
          onBulkPublish={() => void handleBulkPublish()}
          onBulkArchive={() => void handleBulkDeactivate()}
          onBulkDelete={() => void handleBulkDelete()}
          pendingBulk={pendingBulk}
          onCreateNew={() => navigate(routes.products.create)}
        />
      </div>

      <ProductFiltersDrawer
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        filters={filters}
        categoryOptions={categoryOptions}
        brandOptions={brandOptions}
        onApply={setFilters}
        onReset={resetFilters}
      />
    </AdminLayout>
  );
}
