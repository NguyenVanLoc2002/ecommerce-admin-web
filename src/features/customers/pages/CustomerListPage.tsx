import { useState } from 'react';
import { AdminLayout } from '@/shared/components/layout/AdminLayout';
import { PageHeader } from '@/shared/components/layout/PageHeader';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { useTableFilters } from '@/shared/hooks/useTableFilters';
import { SoftDeleteState } from '@/shared/types/api.types';
import { buildSortParam, parseSortParam } from '@/shared/utils/sort';
import type { SortState } from '@/shared/components/table/types';
import { useCustomers } from '../hooks/useCustomers';
import { CustomerDetailModal } from '../components/CustomerDetailModal';
import { CustomerFiltersDrawer } from '../components/CustomerFiltersDrawer';
import { CustomerFormModal } from '../components/CustomerFormModal';
import { CustomerTable } from '../components/CustomerTable';
import type { AdminCustomer, AdminCustomerFilter } from '../types/customer.types';

const DEFAULT_FILTERS: AdminCustomerFilter = {
  page: 0,
  size: 20,
  sort: 'createdAt,desc',
  keyword: undefined,
  email: undefined,
  phoneNumber: undefined,
  status: undefined,
  gender: undefined,
  minLoyaltyPoints: undefined,
  maxLoyaltyPoints: undefined,
  dateFrom: undefined,
  dateTo: undefined,
  deletedState: SoftDeleteState.ACTIVE,
};

export function CustomerListPage() {
  const [filters, setFilters, resetFilters] = useTableFilters<AdminCustomerFilter>(
    DEFAULT_FILTERS,
    { numberKeys: ['minLoyaltyPoints', 'maxLoyaltyPoints'] },
  );
  const sort = parseSortParam(filters.sort);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [detailCustomerId, setDetailCustomerId] = useState<string | undefined>();
  const [editingCustomer, setEditingCustomer] = useState<AdminCustomer | undefined>();
  const [formOpen, setFormOpen] = useState(false);

  const debouncedKeyword = useDebounce(filters.keyword ?? '', 300);
  const queryParams: AdminCustomerFilter = {
    ...filters,
    keyword: debouncedKeyword || undefined,
  };

  const { data, isLoading, isError, isFetching, refetch } = useCustomers(queryParams);

  const handleSortChange = (nextSort: SortState) => {
    setFilters({ sort: buildSortParam(nextSort), page: 0 });
  };

  const openEditForm = (customer: AdminCustomer) => {
    setEditingCustomer(customer);
    setDetailCustomerId(undefined);
    setFormOpen(true);
  };

  const openDetail = (customer: AdminCustomer) => {
    setDetailCustomerId(customer.id);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditingCustomer(undefined);
  };

  const handleFiltersApply = (updates: Partial<AdminCustomerFilter>) => {
    setFilters({ ...updates, page: 0 });
  };

  return (
    <AdminLayout>
      <div className="space-y-6 p-6">
        <PageHeader
          title="Customers"
          description="Manage customer accounts, profiles, status, and loyalty data."
        />

        <CustomerTable
          data={data}
          isLoading={isLoading}
          isError={isError}
          isSearching={isFetching && !isLoading}
          onRetry={() => void refetch()}
          filters={filters}
          onFiltersChange={setFilters}
          sort={sort}
          onSortChange={handleSortChange}
          onOpenFilters={() => setFiltersOpen(true)}
          onView={openDetail}
          onEdit={openEditForm}
        />
      </div>

      <CustomerFiltersDrawer
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        filters={filters}
        onApply={handleFiltersApply}
        onReset={resetFilters}
      />

      <CustomerFormModal
        open={formOpen}
        onClose={closeForm}
        customer={editingCustomer}
      />

      <CustomerDetailModal
        open={detailCustomerId !== undefined}
        customerId={detailCustomerId}
        onClose={() => setDetailCustomerId(undefined)}
        onEdit={(customer) => {
          setDetailCustomerId(undefined);
          openEditForm(customer);
        }}
      />
    </AdminLayout>
  );
}
