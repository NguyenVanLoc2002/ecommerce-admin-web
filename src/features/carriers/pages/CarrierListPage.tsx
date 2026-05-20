import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { routes } from '@/constants/routes';
import { AdminLayout } from '@/shared/components/layout/AdminLayout';
import { PageHeader } from '@/shared/components/layout/PageHeader';
import { IntegrationSummaryCards } from '@/shared/components/integrations/IntegrationSummaryCards';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { useTableFilters } from '@/shared/hooks/useTableFilters';
import { toast } from '@/shared/stores/uiStore';
import { buildSortParam, parseSortParam } from '@/shared/utils/sort';
import type { SortState } from '@/shared/components/table/types';
import { CarrierFormModal } from '../components/CarrierFormModal';
import { CarrierTable } from '../components/CarrierTable';
import { useCarriers } from '../hooks/useCarriers';
import { useCreateCarrier } from '../hooks/useCreateCarrier';
import { useUpdateCarrier } from '../hooks/useUpdateCarrier';
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
  const navigate = useNavigate();
  const [filters, setFilters] = useTableFilters<CarrierListParams>(DEFAULT_FILTERS, {
    booleanKeys: ['enabled'],
  });
  const sort = parseSortParam(filters.sort);
  const [editingCarrier, setEditingCarrier] = useState<Carrier | undefined>();
  const [formOpen, setFormOpen] = useState(false);

  const debouncedKeyword = useDebounce(filters.keyword ?? '', 300);
  const queryParams: CarrierListParams = {
    ...filters,
    keyword: debouncedKeyword || undefined,
  };

  const { data, isLoading, isError, refetch } = useCarriers(queryParams);
  const createCarrier = useCreateCarrier();
  const updateCarrier = useUpdateCarrier();

  const isFormSubmitting = createCarrier.isPending || updateCarrier.isPending;

  const openCreate = () => {
    setEditingCarrier(undefined);
    setFormOpen(true);
  };

  const openEdit = (carrier: Carrier) => {
    setEditingCarrier(carrier);
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditingCarrier(undefined);
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

  const retry = () => void refetch();
  const carriers = data?.items ?? [];
  const catalogActiveCount = carriers.filter((carrier) => carrier.status === 'ACTIVE').length;
  const configEnabledCount = carriers.filter((carrier) => carrier.configEnabled).length;
  const connectedCount = carriers.filter((carrier) => carrier.connectionStatus === 'CONNECTED').length;
  const webhookReadyCount = carriers.filter((carrier) => carrier.hasWebhookSecret).length;

  return (
    <AdminLayout>
      <div className="space-y-6 p-6">
        <PageHeader
          title="Shipping Provider Integrations"
          description="Manage carrier credentials, runtime configuration, webhook readiness, and connection health."
        />

        <IntegrationSummaryCards
          items={[
            {
              label: 'Catalog active',
              value: String(catalogActiveCount),
              hint: 'Active providers remain selectable in shipment creation flows.',
            },
            {
              label: 'Runtime enabled',
              value: String(configEnabledCount),
              hint: 'Enabled runtime config allows provider-backed calls when credentials are complete.',
            },
            {
              label: 'Connected',
              value: String(connectedCount),
              hint: 'Connected uses the latest saved provider health status returned by the backend.',
            },
            {
              label: 'Webhook ready',
              value: String(webhookReadyCount),
              hint: 'Webhook-ready means a provider secret is already stored for callback validation.',
            },
          ]}
        />

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
          onView={(carrier) => navigate(routes.integrations.shippingProviders.detail(carrier.id))}
          onEdit={openEdit}
          onConfigure={(carrier) => navigate(routes.integrations.shippingProviders.detail(carrier.id))}
        />
      </div>

      <CarrierFormModal
        open={formOpen}
        onClose={closeForm}
        carrier={editingCarrier}
        isSubmitting={isFormSubmitting}
        onSubmit={handleSubmitCarrier}
      />
    </AdminLayout>
  );
}
