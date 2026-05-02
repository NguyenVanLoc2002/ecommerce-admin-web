import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { AdminLayout } from '@/shared/components/layout/AdminLayout';
import { PageHeader } from '@/shared/components/layout/PageHeader';
import { Button } from '@/shared/components/ui/Button';
import { useTableFilters } from '@/shared/hooks/useTableFilters';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { usePermission } from '@/constants/permissions';
import { routes } from '@/constants/routes';
import { SoftDeleteState } from '@/shared/types/api.types';
import { buildSortParam, parseSortParam } from '@/shared/utils/sort';
import type { SortState } from '@/shared/components/table/types';
import { usePromotions } from '../hooks/usePromotions';
import { PromotionTable } from '../components/PromotionTable';
import { PromotionFiltersDrawer } from '../components/PromotionFiltersDrawer';
import type { PromotionListParams } from '../types/promotion.types';

const DEFAULT_FILTERS: PromotionListParams = {
  page: 0,
  size: 20,
  sort: 'createdAt,desc',
  name: undefined,
  scope: undefined,
  active: undefined,
  dateFrom: undefined,
  dateTo: undefined,
  deletedState: SoftDeleteState.ACTIVE,
};

export function PromotionListPage() {
  const navigate = useNavigate();
  const canWrite = usePermission('promotions', 'write');
  const [filters, setFilters, resetFilters] = useTableFilters<PromotionListParams>(DEFAULT_FILTERS, {
    booleanKeys: ['active'],
  });
  const sort = parseSortParam(filters.sort);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const debouncedName = useDebounce(filters.name ?? '', 300);
  const queryParams: PromotionListParams = { ...filters, name: debouncedName || undefined };

  const { data, isLoading, isError, refetch } = usePromotions(queryParams);

  const handleSortChange = (newSort: SortState) => {
    setFilters({ sort: buildSortParam(newSort), page: 0 });
  };

  const handleFiltersApply = (updates: Partial<PromotionListParams>) => {
    setFilters({ ...updates, page: 0 });
  };

  return (
    <AdminLayout>
      <div className="space-y-6 p-6">
        <PageHeader
          title="Promotions"
          description="Manage discount promotions and their eligibility rules."
          actions={
            canWrite ? (
              <Button
                onClick={() => navigate(routes.promotions.create)}
                leftIcon={<Plus className="h-4 w-4" />}
              >
                New Promotion
              </Button>
            ) : undefined
          }
        />

        <PromotionTable
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

      <PromotionFiltersDrawer
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        filters={filters}
        onApply={handleFiltersApply}
        onReset={resetFilters}
      />
    </AdminLayout>
  );
}
