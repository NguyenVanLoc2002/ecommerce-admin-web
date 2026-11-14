import { useNavigate } from 'react-router-dom';
import { routes } from '@/constants/routes';
import { AdminLayout } from '@/shared/components/layout/AdminLayout';
import { PageHeader } from '@/shared/components/layout/PageHeader';
import { useTableFilters } from '@/shared/hooks/useTableFilters';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { SoftDeleteState } from '@/shared/types/api.types';
import { buildSortParam, parseSortParam } from '@/shared/utils/sort';
import type { SortState } from '@/shared/components/table/types';
import { useCategories } from '../hooks/useCategories';
import { CategoryTable } from '../components/CategoryTable';
import type { CategoryListParams } from '../types/category.types';

const DEFAULT_FILTERS: CategoryListParams = {
  page: 0,
  size: 20,
  sort: 'name,asc',
  name: undefined,
  slug: undefined,
  parentId: undefined,
  status: undefined,
  deletedState: SoftDeleteState.ACTIVE,
};

export function CategoryListPage() {
  const navigate = useNavigate();
  const [filters, setFilters] = useTableFilters<CategoryListParams>(DEFAULT_FILTERS);
  const sort = parseSortParam(filters.sort);
  const debouncedName = useDebounce(filters.name ?? '', 300);
  const queryParams: CategoryListParams = { ...filters, name: debouncedName || undefined };
  const { data, isLoading, isError, refetch } = useCategories(queryParams);

  const handleSortChange = (newSort: SortState) => {
    setFilters({ sort: buildSortParam(newSort), page: 0 });
  };

  return (
    <AdminLayout>
      <div className="space-y-6 p-6">
        <PageHeader title="Categories" description="Group products so customers can browse and filter." />
        <CategoryTable
          data={data}
          isLoading={isLoading}
          isError={isError}
          onRetry={() => void refetch()}
          filters={filters}
          onFiltersChange={setFilters}
          sort={sort}
          onSortChange={handleSortChange}
          onEdit={(category) => navigate(routes.categories.edit(category.id))}
          onCreateNew={() => navigate(routes.categories.create)}
        />
      </div>
    </AdminLayout>
  );
}
