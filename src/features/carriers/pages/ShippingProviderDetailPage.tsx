import { ArrowLeft, PackageCheck } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { routes } from '@/constants/routes';
import { EmptyState } from '@/shared/components/feedback/EmptyState';
import { ErrorCard } from '@/shared/components/feedback/ErrorCard';
import { SkeletonDetail } from '@/shared/components/feedback/Skeleton';
import { AdminLayout } from '@/shared/components/layout/AdminLayout';
import { PageHeader } from '@/shared/components/layout/PageHeader';
import { useBreadcrumbLabel } from '@/shared/components/layout';
import { Button } from '@/shared/components/ui/Button';
import { Badge } from '@/shared/components/ui/Badge';
import { toast } from '@/shared/stores/uiStore';
import { formatEnumLabel } from '@/shared/utils/formatEnumLabel';
import { AhamoveIntegrationDrawer } from '../components/AhamoveIntegrationDrawer';
import { CarrierConfigModal } from '../components/CarrierConfigModal';
import { CarrierConnectionBadge } from '../components/CarrierConnectionBadge';
import { useCarrier } from '../hooks/useCarrier';
import { useUpdateCarrierConfig } from '../hooks/useUpdateCarrierConfig';
import type { CarrierConfigFormValues } from '../schemas/carrierConfigSchema';

export function ShippingProviderDetailPage() {
  const { providerId } = useParams<{ providerId: string }>();
  const navigate = useNavigate();
  const carrierId = providerId ?? '';
  const carrierQuery = useCarrier(carrierId);
  const updateCarrierConfig = useUpdateCarrierConfig();

  useBreadcrumbLabel(
    routes.integrations.shippingProviders.detail(carrierId),
    carrierQuery.data?.name,
  );

  const handleSubmitConfig = async (values: CarrierConfigFormValues) => {
    if (!carrierQuery.data) {
      return;
    }

    await updateCarrierConfig.mutateAsync({
      id: carrierQuery.data.id,
      body: values,
    });
    toast.success('Provider configuration saved.');
  };

  if (carrierQuery.isLoading && !carrierQuery.data) {
    return (
      <AdminLayout>
        <div className="p-6">
          <SkeletonDetail />
        </div>
      </AdminLayout>
    );
  }

  if (carrierQuery.isError) {
    return (
      <AdminLayout>
        <div className="p-6">
          <ErrorCard
            message="Unable to load this shipping provider integration."
            onRetry={() => void carrierQuery.refetch()}
          />
        </div>
      </AdminLayout>
    );
  }

  if (!carrierQuery.data) {
    return (
      <AdminLayout>
        <div className="p-6">
          <EmptyState
            icon={<PackageCheck className="h-10 w-10" />}
            title="Shipping provider not found"
            message="This integration route is no longer available or the provider was removed."
            action={{
              label: 'Back to Shipping Providers',
              onClick: () => navigate(routes.integrations.shippingProviders.list),
            }}
          />
        </div>
      </AdminLayout>
    );
  }

  const carrier = carrierQuery.data;

  return (
    <AdminLayout>
      <div className="space-y-6 p-6">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => navigate(routes.integrations.shippingProviders.list)}
            aria-label="Back to shipping providers"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <PageHeader
            title={carrier.name}
            description={`Carrier code ${carrier.code}`}
            actions={
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="info">{formatEnumLabel(carrier.providerType)}</Badge>
                <Badge variant={carrier.status === 'ACTIVE' ? 'success' : 'default'}>
                  {carrier.status === 'ACTIVE' ? 'Catalog active' : 'Catalog inactive'}
                </Badge>
                <Badge variant={carrier.configEnabled ? 'success' : 'warning'}>
                  {carrier.configEnabled ? 'Runtime enabled' : 'Runtime disabled'}
                </Badge>
                <CarrierConnectionBadge status={carrier.connectionStatus} />
              </div>
            }
          />
        </div>

        {carrier.providerType === 'AHAMOVE' ? (
          <AhamoveIntegrationDrawer
            open
            inline
            onClose={() => navigate(routes.integrations.shippingProviders.list)}
            carrier={carrier}
          />
        ) : (
          <CarrierConfigModal
            open
            inline
            onClose={() => navigate(routes.integrations.shippingProviders.list)}
            carrier={carrier}
            isSubmitting={updateCarrierConfig.isPending}
            onSubmit={handleSubmitConfig}
          />
        )}
      </div>
    </AdminLayout>
  );
}

