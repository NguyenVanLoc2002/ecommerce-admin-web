import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '@/shared/components/layout/AdminLayout';
import { PageHeader } from '@/shared/components/layout/PageHeader';
import { useTableFilters } from '@/shared/hooks/useTableFilters';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { routes } from '@/constants/routes';
import type { SortState } from '@/shared/components/table/types';
import { useShipments } from '../hooks/useShipments';
import { ShipmentTable } from '../components/ShipmentTable';
import { ShipmentFiltersDrawer } from '../components/ShipmentFiltersDrawer';
import type { ShipmentListParams } from '../types/shipment.types';

const DEFAULT_FILTERS: ShipmentListParams = {
  page: 0,
  size: 20,
  sort: 'createdAt',
  direction: 'desc',
};

export function ShipmentListPage() {
  const navigate = useNavigate();
  const [filters, setFilters, resetFilters] = useTableFilters<ShipmentListParams>(DEFAULT_FILTERS);
  const [sort, setSort] = useState<SortState | undefined>();
  const [filtersOpen, setFiltersOpen] = useState(false);

  const debouncedOrderCode = useDebounce(filters.orderCode ?? '', 300);
  const queryParams: ShipmentListParams = { ...filters, orderCode: debouncedOrderCode || undefined };

  const { data, isLoading, isError, refetch } = useShipments(queryParams);

  const handleSortChange = (newSort: SortState) => {
    setSort(newSort);
    setFilters({ sort: newSort.column, direction: newSort.direction });
  };

  const handleFiltersApply = (updates: Partial<ShipmentListParams>) => {
    setFilters({ ...updates, page: 0 });
  };

  return (
    <AdminLayout>
      <div className="space-y-6 p-6">
        <PageHeader
          title="Shipments"
          description="Track and manage all delivery shipments."
        />

        <ShipmentTable
          data={data}
          isLoading={isLoading}
          isError={isError}
          onRetry={() => void refetch()}
          filters={filters}
          onFiltersChange={setFilters}
          sort={sort}
          onSortChange={handleSortChange}
          onOpenFilters={() => setFiltersOpen(true)}
          onCreateNew={() => navigate(routes.shipments.create)}
        />
      </div>

      <ShipmentFiltersDrawer
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        filters={filters}
        onApply={handleFiltersApply}
        onReset={resetFilters}
      />
    </AdminLayout>
  );
}
