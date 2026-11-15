import { useNavigate } from 'react-router-dom';
import { routes } from '@/constants/routes';
import { AdminLayout } from '@/shared/components/layout/AdminLayout';
import { PageHeader } from '@/shared/components/layout/PageHeader';
import { useTableFilters } from '@/shared/hooks/useTableFilters';
import { usePermission } from '@/constants/permissions';
import { SoftDeleteState } from '@/shared/types/api.types';
import { useWarehouses } from '../hooks/useWarehouses';
import { WarehouseTable } from '../components/WarehouseTable';
import type { WarehouseListParams } from '../types/inventory.types';

const DEFAULT_FILTERS: WarehouseListParams = {
  status: undefined,
  deletedState: SoftDeleteState.ACTIVE,
};

export function WarehouseListPage() {
  const navigate = useNavigate();
  const canWrite = usePermission('warehouses', 'write');
  const [filters, setFilters] = useTableFilters<WarehouseListParams>(DEFAULT_FILTERS);

  const { data, isLoading, isError, refetch } = useWarehouses(filters);
  return (
    <AdminLayout>
      <div className="space-y-6 p-6">
        <PageHeader
          title="Warehouses"
          description="Manage your storage locations."
        />

        <WarehouseTable
          data={data}
          isLoading={isLoading}
          isError={isError}
          onRetry={() => void refetch()}
          filters={filters}
          onFiltersChange={setFilters}
          canWrite={canWrite}
          onEdit={(warehouse) => navigate(routes.warehouses.edit(warehouse.id))}
          onCreateNew={() => navigate(routes.warehouses.create)}
        />
      </div>
    </AdminLayout>
  );
}
