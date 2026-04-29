import { useState } from 'react';
import { AdminLayout } from '@/shared/components/layout/AdminLayout';
import { PageHeader } from '@/shared/components/layout/PageHeader';
import { useTableFilters } from '@/shared/hooks/useTableFilters';
import { useDebounce } from '@/shared/hooks/useDebounce';
import type { SortState } from '@/shared/components/table/types';
import { InvoiceTable } from '../components/InvoiceTable';
import { useInvoices } from '../hooks/useInvoices';
import type { InvoiceListParams } from '../types/invoice.types';

const DEFAULT_FILTERS: InvoiceListParams = {
  page: 0,
  size: 20,
  sort: 'issuedAt,desc',
};

export function InvoiceListPage() {
  const [filters, setFilters] = useTableFilters<InvoiceListParams>(DEFAULT_FILTERS);
  const [sort, setSort] = useState<SortState | undefined>();

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
        />
      </div>
    </AdminLayout>
  );
}
