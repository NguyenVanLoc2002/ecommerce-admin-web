import { useState } from 'react';
import { AdminLayout } from '@/shared/components/layout/AdminLayout';
import { PageHeader } from '@/shared/components/layout/PageHeader';
import { useTableFilters } from '@/shared/hooks/useTableFilters';
import { useDebounce } from '@/shared/hooks/useDebounce';
import type { SortState } from '@/shared/components/table/types';
import { usePayments } from '../hooks/usePayments';
import { PaymentTable } from '../components/PaymentTable';
import { PaymentFiltersDrawer } from '../components/PaymentFiltersDrawer';
import type { PaymentListParams } from '../types/payment.types';

const DEFAULT_FILTERS: PaymentListParams = {
  page: 0,
  size: 20,
  sort: 'createdAt,desc',
  orderCode: undefined,
  method: undefined,
  status: undefined,
  dateFrom: undefined,
  dateTo: undefined,
};

export function PaymentListPage() {
  const [filters, setFilters, resetFilters] = useTableFilters<PaymentListParams>(DEFAULT_FILTERS);
  const [sort, setSort] = useState<SortState | undefined>();
  const [filtersOpen, setFiltersOpen] = useState(false);

  const debouncedOrderCode = useDebounce(filters.orderCode ?? '', 300);
  const queryParams: PaymentListParams = { ...filters, orderCode: debouncedOrderCode || undefined };

  const { data, isLoading, isError, refetch } = usePayments(queryParams);

  const handleSortChange = (newSort: SortState) => {
    setSort(newSort);
    setFilters({ sort: `${newSort.column},${newSort.direction}` });
  };

  const handleFiltersApply = (updates: Partial<PaymentListParams>) => {
    setFilters({ ...updates, page: 0 });
  };

  return (
    <AdminLayout>
      <div className="space-y-6 p-6">
        <PageHeader
          title="Payments"
          description="View and manage all payment records."
        />

        <PaymentTable
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

      <PaymentFiltersDrawer
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        filters={filters}
        onApply={handleFiltersApply}
        onReset={resetFilters}
      />
    </AdminLayout>
  );
}
