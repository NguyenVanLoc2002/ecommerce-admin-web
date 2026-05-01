import { useState } from 'react';
import { AdminLayout } from '@/shared/components/layout/AdminLayout';
import { PageHeader } from '@/shared/components/layout/PageHeader';
import { useTableFilters } from '@/shared/hooks/useTableFilters';
import { useDebounce } from '@/shared/hooks/useDebounce';
import type { SortState } from '@/shared/components/table/types';
import { InvoiceTable } from '../components/InvoiceTable';
import { InvoiceFiltersDrawer } from '../components/InvoiceFiltersDrawer';
import { useInvoices } from '../hooks/useInvoices';
import type { InvoiceListParams } from '../types/invoice.types';

const DEFAULT_FILTERS: InvoiceListParams = {
  page: 0,
  size: 20,
  sort: 'issuedAt,desc',
  invoiceCode: undefined,
  orderCode: undefined,
  status: undefined,
  dateFrom: undefined,
  dateTo: undefined,
};

export function InvoiceListPage() {
  const [filters, setFilters, resetFilters] = useTableFilters<InvoiceListParams>(DEFAULT_FILTERS);
  const [sort, setSort] = useState<SortState | undefined>();
  const [filtersOpen, setFiltersOpen] = useState(false);

  const debouncedInvoiceCode = useDebounce(filters.invoiceCode ?? '', 300);
  const queryParams: InvoiceListParams = {
    ...filters,
    invoiceCode: debouncedInvoiceCode || undefined,
  };

  const { data, isLoading, isError, refetch } = useInvoices(queryParams);

  const handleSortChange = (nextSort: SortState) => {
    setSort(nextSort);
    setFilters({ sort: `${nextSort.column},${nextSort.direction}` });
  };

  const handleFiltersApply = (updates: Partial<InvoiceListParams>) => {
    setFilters({ ...updates, page: 0 });
  };

  return (
    <AdminLayout>
      <div className="space-y-6 p-6">
        <PageHeader
          title="Invoices"
          description="View and manage all invoice records."
        />

        <InvoiceTable
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

      <InvoiceFiltersDrawer
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        filters={filters}
        onApply={handleFiltersApply}
        onReset={resetFilters}
      />
    </AdminLayout>
  );
}
