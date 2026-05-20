import { ArrowLeft, CreditCard } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { routes } from '@/constants/routes';
import { EmptyState } from '@/shared/components/feedback/EmptyState';
import { AdminLayout } from '@/shared/components/layout/AdminLayout';
import { PageHeader } from '@/shared/components/layout/PageHeader';
import { useBreadcrumbLabel } from '@/shared/components/layout';
import { Button } from '@/shared/components/ui/Button';
import { Badge } from '@/shared/components/ui/Badge';
import { IntegrationErrorAlert } from '@/shared/components/integrations/IntegrationErrorAlert';
import { MomoIntegrationCard } from '../components/MomoIntegrationCard';
import { PaypalIntegrationCard } from '../components/PaypalIntegrationCard';
import { useMomoPaymentIntegration } from '../hooks/useMomoPaymentIntegration';
import { usePaypalPaymentIntegration } from '../hooks/usePaypalPaymentIntegration';

const PROVIDER_META = {
  momo: {
    label: 'MoMo',
    description:
      'Review credentials, checkout defaults, IPN readiness, and runtime timeout behavior for MoMo.',
  },
  paypal: {
    label: 'PayPal',
    description:
      'Review credentials, checkout defaults, webhook readiness, and runtime timeout behavior for PayPal.',
  },
} as const;

export function PaymentProviderDetailPage() {
  const { providerCode } = useParams<{ providerCode: string }>();
  const navigate = useNavigate();
  const normalizedCode = providerCode?.toLowerCase() ?? '';
  const providerMeta = PROVIDER_META[normalizedCode as keyof typeof PROVIDER_META];

  useBreadcrumbLabel(
    providerCode ? routes.integrations.paymentProviders.detail(providerCode) : undefined,
    providerMeta?.label,
  );

  const momoQuery = useMomoPaymentIntegration();
  const paypalQuery = usePaypalPaymentIntegration();

  if (!providerMeta) {
    return (
      <AdminLayout>
        <div className="p-6">
          <EmptyState
            icon={<CreditCard className="h-10 w-10" />}
            title="Payment provider not found"
            message="This provider route is not available in the current admin build."
            action={{
              label: 'Back to Payment Providers',
              onClick: () => navigate(routes.integrations.paymentProviders.list),
            }}
          />
        </div>
      </AdminLayout>
    );
  }

  const selectedQuery = normalizedCode === 'momo' ? momoQuery : paypalQuery;

  return (
    <AdminLayout>
      <div className="space-y-6 p-6">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => navigate(routes.integrations.paymentProviders.list)}
            aria-label="Back to payment providers"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <PageHeader
            title={providerMeta.label}
            description={providerMeta.description}
            actions={
              <Badge variant="default">
                {normalizedCode === 'momo' ? 'Payment provider' : 'Checkout provider'}
              </Badge>
            }
          />
        </div>

        {selectedQuery.isError ? (
          <IntegrationErrorAlert
            title={`Unable to load ${providerMeta.label} configuration.`}
            message="Retry after the provider configuration endpoint is available again."
            onRetry={() => void selectedQuery.refetch()}
          />
        ) : normalizedCode === 'momo' ? (
          <MomoIntegrationCard />
        ) : (
          <PaypalIntegrationCard />
        )}
      </div>
    </AdminLayout>
  );
}

