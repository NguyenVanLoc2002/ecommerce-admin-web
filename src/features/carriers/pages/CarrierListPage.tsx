import { useState } from 'react';
import { AdminLayout } from '@/shared/components/layout/AdminLayout';
import { PageHeader } from '@/shared/components/layout/PageHeader';
import { Badge } from '@/shared/components/ui/Badge';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { useTableFilters } from '@/shared/hooks/useTableFilters';
import { toast } from '@/shared/stores/uiStore';
import { buildSortParam, parseSortParam } from '@/shared/utils/sort';
import type { SortState } from '@/shared/components/table/types';
import { AhamoveIntegrationDrawer } from '../components/AhamoveIntegrationDrawer';
import { CarrierConfigModal } from '../components/CarrierConfigModal';
import { CarrierDetailModal } from '../components/CarrierDetailModal';
import { CarrierFormModal } from '../components/CarrierFormModal';
import { CarrierTable } from '../components/CarrierTable';
import { useCarriers } from '../hooks/useCarriers';
import { useCreateCarrier } from '../hooks/useCreateCarrier';
import { useUpdateCarrier } from '../hooks/useUpdateCarrier';
import { useUpdateCarrierConfig } from '../hooks/useUpdateCarrierConfig';
import type { CarrierConfigFormValues } from '../schemas/carrierConfigSchema';
import type { CarrierFormValues } from '../schemas/carrierSchema';
import type { Carrier, CarrierListParams } from '../types/carrier.types';

const DEFAULT_FILTERS: CarrierListParams = {
  page: 0,
  size: 20,
  sort: 'updatedAt,desc',
  keyword: undefined,
  providerType: undefined,
  status: undefined,
  enabled: undefined,
};

export function CarrierListPage() {
  const [filters, setFilters] = useTableFilters<CarrierListParams>(DEFAULT_FILTERS, {
    booleanKeys: ['enabled'],
  });
  const sort = parseSortParam(filters.sort);
  const [detailCarrier, setDetailCarrier] = useState<Carrier | undefined>();
  const [editingCarrier, setEditingCarrier] = useState<Carrier | undefined>();
  const [configCarrier, setConfigCarrier] = useState<Carrier | undefined>();
  const [detailOpen, setDetailOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [configOpen, setConfigOpen] = useState(false);

  const debouncedKeyword = useDebounce(filters.keyword ?? '', 300);
  const queryParams: CarrierListParams = {
    ...filters,
    keyword: debouncedKeyword || undefined,
  };

  const { data, isLoading, isError, refetch } = useCarriers(queryParams);
  const createCarrier = useCreateCarrier();
  const updateCarrier = useUpdateCarrier();
  const updateCarrierConfig = useUpdateCarrierConfig();

  const isFormSubmitting = createCarrier.isPending || updateCarrier.isPending;
  const isConfigSubmitting = updateCarrierConfig.isPending;

  const openCreate = () => {
    setEditingCarrier(undefined);
    setFormOpen(true);
  };

  const openEdit = (carrier: Carrier) => {
    setEditingCarrier(carrier);
    setFormOpen(true);
  };

  const openDetail = (carrier: Carrier) => {
    setDetailCarrier(carrier);
    setDetailOpen(true);
  };

  const openConfig = (carrier: Carrier) => {
    setConfigCarrier(carrier);
    setConfigOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditingCarrier(undefined);
  };

  const closeDetail = () => {
    setDetailOpen(false);
    setDetailCarrier(undefined);
  };

  const closeConfig = () => {
    setConfigOpen(false);
    setConfigCarrier(undefined);
  };

  const handleSortChange = (nextSort: SortState) => {
    setFilters({ sort: buildSortParam(nextSort), page: 0 });
  };

  const handleSubmitCarrier = async (values: CarrierFormValues) => {
    if (editingCarrier) {
      await updateCarrier.mutateAsync({
        id: editingCarrier.id,
        body: values,
      });
      toast.success('Carrier saved.');
    } else {
      await createCarrier.mutateAsync(values);
      toast.success('Carrier created.');
    }

    closeForm();
  };

  const handleSubmitConfig = async (values: CarrierConfigFormValues) => {
    if (!configCarrier) {
      return;
    }

    await updateCarrierConfig.mutateAsync({
      id: configCarrier.id,
      body: values,
    });
    toast.success('Carrier configuration saved.');
    closeConfig();
  };

  const retry = () => void refetch();

  return (
    <AdminLayout>
      <div className="space-y-6 p-6">
        <PageHeader
          title="Shipping Providers"
          description="Review catalog status, typed AhaMove setup, connection health, and webhook readiness from one operational surface."
        />

        <div className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-2xl border border-gray-200 bg-white px-5 py-4">
            <Badge variant="success" dot>
              Catalog status
            </Badge>
            <p className="mt-3 text-sm text-gray-600">
              Active means staff can select the provider in shipment flows. Inactive removes it from catalog selection.
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white px-5 py-4">
            <Badge variant="warning" dot>
              Config enabled
            </Badge>
            <p className="mt-3 text-sm text-gray-600">
              This is separate from catalog status. A provider can stay listed while its backend config remains disabled.
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white px-5 py-4">
            <Badge variant="info" dot>
              Secret handling
            </Badge>
            <p className="mt-3 text-sm text-gray-600">
              API keys and webhook secrets are write-only. The backend returns saved state and masked token metadata only.
            </p>
          </div>
        </div>

        <CarrierTable
          data={data}
          isLoading={isLoading}
          isError={isError}
          onRetry={retry}
          filters={filters}
          onFiltersChange={setFilters}
          sort={sort}
          onSortChange={handleSortChange}
          onCreateNew={openCreate}
          onView={openDetail}
          onEdit={openEdit}
          onConfigure={openConfig}
        />
      </div>

      <CarrierFormModal
        open={formOpen}
        onClose={closeForm}
        carrier={editingCarrier}
        isSubmitting={isFormSubmitting}
        onSubmit={handleSubmitCarrier}
      />

      <CarrierDetailModal
        open={detailOpen}
        onClose={closeDetail}
        carrier={detailCarrier}
        onConfigure={(carrier) => {
          closeDetail();
          openConfig(carrier);
        }}
      />

      <CarrierConfigModal
        open={configOpen && configCarrier?.providerType !== 'AHAMOVE'}
        onClose={closeConfig}
        carrier={configCarrier}
        isSubmitting={isConfigSubmitting}
        onSubmit={handleSubmitConfig}
      />

      <AhamoveIntegrationDrawer
        open={configOpen && configCarrier?.providerType === 'AHAMOVE'}
        onClose={closeConfig}
        carrier={configCarrier}
      />
    </AdminLayout>
  );
}
