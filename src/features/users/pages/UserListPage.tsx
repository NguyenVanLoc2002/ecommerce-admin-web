import { useState } from 'react';
import { AdminLayout } from '@/shared/components/layout/AdminLayout';
import { PageHeader } from '@/shared/components/layout/PageHeader';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { useTableFilters } from '@/shared/hooks/useTableFilters';
import { buildSortParam, parseSortParam } from '@/shared/utils/sort';
import type { SortState } from '@/shared/components/table/types';
import { useUsers } from '../hooks/useUsers';
import { UserDetailModal } from '../components/UserDetailModal';
import { UserFiltersDrawer } from '../components/UserFiltersDrawer';
import { UserFormModal } from '../components/UserFormModal';
import { UserTable } from '../components/UserTable';
import type { AdminUser, AdminUserListParams } from '../types/user.types';

const DEFAULT_FILTERS: AdminUserListParams = {
  page: 0,
  size: 20,
  sort: 'createdAt,desc',
  keyword: undefined,
  email: undefined,
  phoneNumber: undefined,
  status: undefined,
  role: undefined,
};

export function UserListPage() {
  const [filters, setFilters, resetFilters] =
    useTableFilters<AdminUserListParams>(DEFAULT_FILTERS);
  const sort = parseSortParam(filters.sort);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [detailUserId, setDetailUserId] = useState<string | undefined>();
  const [editingUser, setEditingUser] = useState<AdminUser | undefined>();
  const [formOpen, setFormOpen] = useState(false);

  const debouncedKeyword = useDebounce(filters.keyword ?? '', 300);
  const queryParams: AdminUserListParams = {
    ...filters,
    keyword: debouncedKeyword || undefined,
  };

  const { data, isLoading, isError, isFetching, refetch } = useUsers(queryParams);

  const handleSortChange = (nextSort: SortState) => {
    setFilters({ sort: buildSortParam(nextSort), page: 0 });
  };

  const openCreateForm = () => {
    setEditingUser(undefined);
    setFormOpen(true);
  };

  const openEditForm = (user: AdminUser) => {
    setEditingUser(user);
    setDetailUserId(undefined);
    setFormOpen(true);
  };

  const openDetail = (user: AdminUser) => {
    setDetailUserId(user.id);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditingUser(undefined);
  };

  const handleFiltersApply = (updates: Partial<AdminUserListParams>) => {
    setFilters({ ...updates, page: 0 });
  };

  return (
    <AdminLayout>
      <div className="space-y-6 p-6">
        <PageHeader
          title="Staff"
          description="Manage internal staff, admins, and system access. Customer accounts are managed under Customers."
        />

        <UserTable
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
          onCreate={openCreateForm}
          onView={openDetail}
          onEdit={openEditForm}
        />
      </div>

      <UserFiltersDrawer
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        filters={filters}
        onApply={handleFiltersApply}
        onReset={resetFilters}
      />

      <UserFormModal open={formOpen} onClose={closeForm} user={editingUser} />

      <UserDetailModal
        open={detailUserId !== undefined}
        userId={detailUserId}
        onClose={() => setDetailUserId(undefined)}
        onEdit={(user) => {
          setDetailUserId(undefined);
          openEditForm(user);
        }}
      />
    </AdminLayout>
  );
}
