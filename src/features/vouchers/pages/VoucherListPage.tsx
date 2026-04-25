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
import { useVouchers } from '../hooks/useVouchers';
import { VoucherTable } from '../components/VoucherTable';
import { VoucherFiltersDrawer } from '../components/VoucherFiltersDrawer';
import type { VoucherListParams } from '../types/voucher.types';

const DEFAULT_FILTERS: VoucherListParams = {
  page: 0,
  size: 20,
  sort: 'createdAt,desc',
};

export function VoucherListPage() {
  const navigate = useNavigate();
  const canWrite = usePermission('vouchers', 'write');
  const [filters, setFilters, resetFilters] = useTableFilters<VoucherListParams>(DEFAULT_FILTERS);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const debouncedCode = useDebounce(filters.code ?? '', 300);
  const queryParams: VoucherListParams = { ...filters, code: debouncedCode || undefined };

  const { data, isLoading, isError, refetch } = useVouchers(queryParams);

  const handleFiltersApply = (updates: Partial<VoucherListParams>) => {
    setFilters({ ...updates, page: 0 });
  };

  return (
    <AdminLayout>
      <div className="space-y-6 p-6">
        <PageHeader
          title="Vouchers"
          description="Manage discount voucher codes linked to promotions."
          actions={
            canWrite ? (
              <Button
                onClick={() => navigate(routes.vouchers.create)}
                leftIcon={<Plus className="h-4 w-4" />}
              >
                New Voucher
              </Button>
            ) : undefined
          }
        />

        <VoucherTable
          data={data}
          isLoading={isLoading}
          isError={isError}
          onRetry={() => void refetch()}
          filters={filters}
          onFiltersChange={setFilters}
          onOpenFilters={() => setFiltersOpen(true)}
        />
      </div>

      <VoucherFiltersDrawer
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        filters={filters}
        onApply={handleFiltersApply}
        onReset={resetFilters}
      />
    </AdminLayout>
  );
}
