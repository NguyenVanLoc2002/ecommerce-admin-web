import { AdminLayout } from '@/shared/components/layout/AdminLayout';
import { PageHeader } from '@/shared/components/layout/PageHeader';
import { useTableFilters } from '@/shared/hooks/useTableFilters';
import { useReservations } from '../hooks/useReservations';
import { useWarehouseOptions } from '../hooks/useWarehouseOptions';
import { ReservationTable } from '../components/ReservationTable';
import type { ReservationParams } from '../types/inventory.types';

const DEFAULT_FILTERS: ReservationParams = {
  page: 0,
  size: 20,
  sort: 'createdAt,desc',
};

export function ReservationListPage() {
  const [filters, setFilters] = useTableFilters<ReservationParams>(DEFAULT_FILTERS);

  const { data, isLoading, isError, refetch } = useReservations(filters);
  const { data: warehouseData } = useWarehouseOptions();

  const warehouses = warehouseData?.items ?? [];

  return (
    <AdminLayout>
      <div className="space-y-6 p-6">
        <PageHeader
          title="Reservations"
          description="Stock held against pending orders."
        />

        <ReservationTable
          data={data}
          isLoading={isLoading}
          isError={isError}
          onRetry={() => void refetch()}
          filters={filters}
          onFiltersChange={setFilters}
          warehouses={warehouses}
        />
      </div>
    </AdminLayout>
  );
}
