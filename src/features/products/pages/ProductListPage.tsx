import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '@/shared/components/layout/AdminLayout';
import { PageHeader } from '@/shared/components/layout/PageHeader';
import { useConfirmDialog } from '@/shared/hooks/useConfirmDialog';
import { useTableFilters } from '@/shared/hooks/useTableFilters';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { toast } from '@/shared/stores/uiStore';
import { routes } from '@/constants/routes';
import type { SortState, RowSelectionState } from '@/shared/components/table/types';
import type { MultiSelectOption } from '@/shared/components/ui/MultiSelectDropdown';
import { useProducts } from '../hooks/useProducts';
import { useBulkUpdateProductStatus, useBulkDeleteProducts } from '../hooks/useBulkProducts';
import { useBrandOptions } from '../hooks/useCatalogOptions';
import { ProductTable } from '../components/ProductTable';
import { ProductFiltersDrawer } from '../components/ProductFiltersDrawer';
import type { ProductListParams } from '../types/product.types';

const DEFAULT_FILTERS: ProductListParams = {
  page: 0,
  size: 20,
  sort: 'createdAt,desc',
};

type BulkAction = 'publish' | 'deactivate' | 'delete';

export function ProductListPage() {
  const navigate = useNavigate();
  const { confirm } = useConfirmDialog();
  const [filters, setFilters, resetFilters] = useTableFilters<ProductListParams>(DEFAULT_FILTERS);
  const [sort, setSort] = useState<SortState | undefined>();
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [pendingBulk, setPendingBulk] = useState<BulkAction | null>(null);

  const debouncedKeyword = useDebounce(filters.keyword ?? '', 300);
  const queryParams: ProductListParams = { ...filters, keyword: debouncedKeyword || undefined };

  const { data, isLoading, isError, refetch } = useProducts(queryParams);
  const bulkUpdateStatus = useBulkUpdateProductStatus();
  const bulkDelete = useBulkDeleteProducts();
  const { data: brandsData } = useBrandOptions();

  const selectedIds = Object.entries(rowSelection)
    .filter(([, v]) => v)
    .map(([id]) => Number(id));

  const brandOptions: MultiSelectOption[] = (brandsData?.items ?? []).map((b) => ({
    value: b.id,
    label: b.name,
  }));

  const handleSortChange = (newSort: SortState) => {
    setSort(newSort);
    setFilters({ sort: `${newSort.column},${newSort.direction}` });
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
        toast.warning(`${result.succeeded} deleted, ${result.failed} failed.`);
      } else {
        toast.success(`${result.succeeded} product${result.succeeded > 1 ? 's' : ''} deleted.`);
      }
    } finally {
      setPendingBulk(null);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 p-6">
        <PageHeader
          title="Products"
          description="Manage your product catalog."
        />

        <ProductTable
          data={data}
          isLoading={isLoading}
          isError={isError}
          onRetry={() => void refetch()}
          filters={filters}
          onFiltersChange={setFilters}
          onReset={resetFilters}
          onOpenFilters={() => setFiltersOpen(true)}
          sort={sort}
          onSortChange={handleSortChange}
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
        brandOptions={brandOptions}
        onApply={setFilters}
        onReset={resetFilters}
      />
    </AdminLayout>
  );
}
