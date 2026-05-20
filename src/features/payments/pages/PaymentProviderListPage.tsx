import { ChevronRight, CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { routes } from '@/constants/routes';
import { AdminLayout } from '@/shared/components/layout/AdminLayout';
import { PageHeader } from '@/shared/components/layout/PageHeader';
import { Badge } from '@/shared/components/ui/Badge';
import { Button } from '@/shared/components/ui/Button';
import { EmptyState } from '@/shared/components/feedback/EmptyState';
import { SkeletonTable } from '@/shared/components/feedback/Skeleton';
import { IntegrationErrorAlert } from '@/shared/components/integrations/IntegrationErrorAlert';
import { IntegrationSummaryCards } from '@/shared/components/integrations/IntegrationSummaryCards';
import { useMomoPaymentIntegration } from '../hooks/useMomoPaymentIntegration';
import { usePaypalPaymentIntegration } from '../hooks/usePaypalPaymentIntegration';
import type {
  MomoPaymentIntegration,
  PaypalPaymentIntegration,
} from '../types/payment.types';

type PaymentProviderSummary = {
  providerCode: 'momo' | 'paypal';
  providerName: string;
  environment: string;
  enabled: boolean;
  secretsSaved: string;
  webhookReadiness: string;
  healthLabel: string;
  healthVariant: 'success' | 'warning' | 'default';
  lastHealthCheck: string;
};

function buildMomoSummary(integration: MomoPaymentIntegration): PaymentProviderSummary {
  const requiredFieldsReady = Boolean(
    integration.hasPartnerCode
      && integration.hasAccessKey
      && integration.hasSecretKey
      && integration.createUrl
      && integration.redirectUrl
      && integration.ipnUrl,
  );
  const secretsSaved = Number(integration.hasPartnerCode)
    + Number(integration.hasAccessKey)
    + Number(integration.hasSecretKey);

  return {
    providerCode: 'momo',
    providerName: 'MoMo',
    environment: integration.environment?.trim() || 'Not set',
    enabled: integration.enabled,
    secretsSaved: `${secretsSaved} / 3`,
    webhookReadiness: integration.ipnUrl ? 'IPN ready' : 'IPN not configured',
    healthLabel: !integration.enabled ? 'Disabled' : requiredFieldsReady ? 'Ready' : 'Needs config',
    healthVariant: !integration.enabled ? 'default' : requiredFieldsReady ? 'success' : 'warning',
    lastHealthCheck: 'Not available',
  };
}

function buildPaypalSummary(integration: PaypalPaymentIntegration): PaymentProviderSummary {
  const requiredFieldsReady = Boolean(
    integration.hasClientId
      && integration.hasClientSecret
      && integration.baseUrl
      && integration.returnUrl
      && integration.cancelUrl,
  );
  const secretsSaved = Number(integration.hasClientId) + Number(integration.hasClientSecret);

  return {
    providerCode: 'paypal',
    providerName: 'PayPal',
    environment: integration.environment?.trim() || 'Not set',
    enabled: integration.enabled,
    secretsSaved: `${secretsSaved} / 2`,
    webhookReadiness: integration.webhookId ? 'Webhook ready' : 'Webhook not configured',
    healthLabel: !integration.enabled ? 'Disabled' : requiredFieldsReady ? 'Ready' : 'Needs config',
    healthVariant: !integration.enabled ? 'default' : requiredFieldsReady ? 'success' : 'warning',
    lastHealthCheck: 'Not available',
  };
}

function SummaryTable({
  providers,
  onManage,
}: {
  providers: PaymentProviderSummary[];
  onManage: (providerCode: PaymentProviderSummary['providerCode']) => void;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr className="text-left text-xs font-medium uppercase tracking-[0.08em] text-gray-500">
              <th className="px-6 py-3">Provider</th>
              <th className="px-6 py-3">Environment</th>
              <th className="px-6 py-3">Enabled</th>
              <th className="px-6 py-3">Secrets saved</th>
              <th className="px-6 py-3">Webhook / IPN</th>
              <th className="px-6 py-3">Health</th>
              <th className="px-6 py-3">Last health check</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {providers.map((provider) => (
              <tr key={provider.providerCode}>
                <td className="px-6 py-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{provider.providerName}</p>
                    <p className="mt-1 text-xs font-mono text-gray-500">{provider.providerCode}</p>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{provider.environment}</td>
                <td className="px-6 py-4">
                  <Badge variant={provider.enabled ? 'success' : 'default'}>
                    {provider.enabled ? 'Enabled' : 'Disabled'}
                  </Badge>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{provider.secretsSaved}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{provider.webhookReadiness}</td>
                <td className="px-6 py-4">
                  <Badge variant={provider.healthVariant}>{provider.healthLabel}</Badge>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">{provider.lastHealthCheck}</td>
                <td className="px-6 py-4 text-right">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => onManage(provider.providerCode)}
                    rightIcon={<ChevronRight className="h-4 w-4" />}
                  >
                    Manage
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function PaymentProviderListPage() {
  const navigate = useNavigate();
  const momoQuery = useMomoPaymentIntegration();
  const paypalQuery = usePaypalPaymentIntegration();

  const isLoading =
    (momoQuery.isLoading && !momoQuery.data) || (paypalQuery.isLoading && !paypalQuery.data);
  const hasError = momoQuery.isError || paypalQuery.isError;

  const providers =
    momoQuery.data && paypalQuery.data
      ? [buildMomoSummary(momoQuery.data), buildPaypalSummary(paypalQuery.data)]
      : [];

  const configuredProviders = providers.filter((provider) => provider.healthLabel === 'Ready').length;
  const enabledProviders = providers.filter((provider) => provider.enabled).length;
  const webhookReadyProviders = providers.filter((provider) =>
    provider.webhookReadiness.toLowerCase().includes('ready')).length;

  return (
    <AdminLayout>
      <div className="space-y-6 p-6">
        <PageHeader
          title="Payment Provider Integrations"
          description="Manage payment provider credentials, checkout configuration, IPN/webhook readiness, and connection health."
        />

        {providers.length > 0 && (
          <IntegrationSummaryCards
            items={[
              {
                label: 'Providers',
                value: String(providers.length),
                hint: 'MoMo and PayPal are available now, with room for future providers.',
              },
              {
                label: 'Enabled',
                value: String(enabledProviders),
                hint: 'Enabled providers can be selected by runtime checkout flows.',
              },
              {
                label: 'Ready',
                value: String(configuredProviders),
                hint: 'Ready means core credentials and required callback fields are present.',
              },
              {
                label: 'Webhook / IPN ready',
                value: String(webhookReadyProviders),
                hint: 'This reflects saved callback identifiers, not a live backend health probe.',
              },
            ]}
          />
        )}

        {isLoading ? (
          <SkeletonTable rows={4} />
        ) : hasError ? (
          <IntegrationErrorAlert
            title="Unable to load payment provider integrations."
            message="Retry after the provider configuration APIs are available again."
            onRetry={() => {
              void momoQuery.refetch();
              void paypalQuery.refetch();
            }}
          />
        ) : providers.length === 0 ? (
          <EmptyState
            icon={<CreditCard className="h-10 w-10" />}
            title="No payment provider integrations found."
            message="Create or configure a provider before staff rely on provider-backed checkout flows."
          />
        ) : (
          <SummaryTable
            providers={providers}
            onManage={(providerCode) => navigate(routes.integrations.paymentProviders.detail(providerCode))}
          />
        )}
      </div>
    </AdminLayout>
  );
}
