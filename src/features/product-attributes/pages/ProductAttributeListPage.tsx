import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '@/shared/components/layout/AdminLayout';
import { PageHeader } from '@/shared/components/layout/PageHeader';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { useTableFilters } from '@/shared/hooks/useTableFilters';
import { SoftDeleteState } from '@/shared/types/api.types';
import { routes } from '@/constants/routes';
import { buildSortParam, parseSortParam } from '@/shared/utils/sort';
import type { SortState } from '@/shared/components/table/types';
import { ProductAttributeTable } from '../components/ProductAttributeTable';
import { useProductAttributes } from '../hooks/useProductAttributes';
import type {
  ProductAttributeListParams,
} from '../types/productAttribute.types';

const DEFAULT_FILTERS: ProductAttributeListParams = {
  page: 0,
  size: 20,
  sort: 'createdAt,desc',
  keyword: undefined,
  type: undefined,
  deletedState: SoftDeleteState.ACTIVE,
};

export function ProductAttributeListPage() {
  const navigate = useNavigate();
  const [filters, setFilters] = useTableFilters<ProductAttributeListParams>(DEFAULT_FILTERS);
  const sort = parseSortParam(filters.sort);

  const debouncedKeyword = useDebounce(filters.keyword ?? '', 300);
  const queryParams: ProductAttributeListParams = {
    ...filters,
    keyword: debouncedKeyword || undefined,
  };

  const { data, isLoading, isError, refetch } = useProductAttributes(queryParams);

  const handleSortChange = (nextSort: SortState) => {
    setFilters({ sort: buildSortParam(nextSort), page: 0 });
  };

  return (
    <AdminLayout>
      <div className="space-y-6 p-6">
        <PageHeader
          title="Product Attributes"
          description="Manage reusable product attributes such as Color, Size, Material."
        />

        <ProductAttributeTable
          data={data}
          isLoading={isLoading}
          isError={isError}
          onRetry={() => void refetch()}
          filters={filters}
          onFiltersChange={setFilters}
          sort={sort}
          onSortChange={handleSortChange}
          onEdit={(attribute) => navigate(routes.productAttributes.edit(attribute.id))}
          onCreateNew={() => navigate(routes.productAttributes.create)}
        />
      </div>
    </AdminLayout>
  );
}
