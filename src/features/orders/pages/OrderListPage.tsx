import { useState } from 'react';
import { AdminLayout } from '@/shared/components/layout/AdminLayout';
import { PageHeader } from '@/shared/components/layout/PageHeader';
import { useTableFilters } from '@/shared/hooks/useTableFilters';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { buildSortParam, parseSortParam } from '@/shared/utils/sort';
import type { SortState } from '@/shared/components/table/types';
import { useOrders } from '../hooks/useOrders';
import { OrderTable } from '../components/OrderTable';
import { OrderFiltersDrawer } from '../components/OrderFiltersDrawer';
import type { OrderListParams } from '../types/order.types';

const DEFAULT_FILTERS: OrderListParams = {
  page: 0,
  size: 20,
  sort: 'createdAt,desc',
  customerId: undefined,
  status: undefined,
  paymentStatus: undefined,
};

export function OrderListPage() {
  const [filters, setFilters, resetFilters] = useTableFilters<OrderListParams>(DEFAULT_FILTERS);
  const sort = parseSortParam(filters.sort);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const debouncedCustomerId = useDebounce(filters.customerId ?? '', 300);
  const queryParams: OrderListParams = {
    ...filters,
    customerId: debouncedCustomerId || undefined,
  };

  const { data, isLoading, isError, refetch } = useOrders(queryParams);

  const handleSortChange = (newSort: SortState) => {
    setFilters({ sort: buildSortParam(newSort), page: 0 });
  };

  const handleFiltersApply = (updates: Partial<OrderListParams>) => {
    setFilters({ ...updates, page: 0 });
  };

  return (
    <AdminLayout>
      <div className="space-y-6 p-6">
        <PageHeader
          title="Orders"
          description="View and manage customer orders."
        />

        <OrderTable
          data={data}
          isLoading={isLoading}
          isError={isError}
          onRetry={() => void refetch()}
          filters={filters}
          onFiltersChange={setFilters}
          sort={sort}
          onSortChange={handleSortChange}
          onOpenFilters={() => setFiltersOpen(true)}
        />
      </div>

      <OrderFiltersDrawer
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        filters={filters}
        onApply={handleFiltersApply}
        onReset={resetFilters}
      />
    </AdminLayout>
  );
}
