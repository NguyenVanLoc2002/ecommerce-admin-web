import { useEffect } from 'react';
import { Controller, FormProvider, useForm, type Path } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/shared/components/ui/Button';
import { Checkbox } from '@/shared/components/ui/Checkbox';
import { Toggle } from '@/shared/components/ui/Toggle';
import { ErrorCard } from '@/shared/components/feedback';
import { FormField } from '@/shared/components/form/FormField';
import { AppError } from '@/shared/types/api.types';
import { toast } from '@/shared/stores/uiStore';
import { getPhase3AdminErrorMessage } from '@/shared/utils/adminPhase3Errors';
import { useMomoPaymentIntegration } from '../hooks/useMomoPaymentIntegration';
import { useUpdateMomoPaymentIntegration } from '../hooks/useUpdateMomoPaymentIntegration';
import {
  momoPaymentIntegrationSchema,
  type MomoPaymentIntegrationFormValues,
} from '../schemas/paymentIntegrationSchema';
import {
  buildMomoIntegrationPayload,
  mapMomoIntegrationToFormValues,
} from '../utils/paymentIntegrationForm';
import {
  IntegrationCard,
  IntegrationCardSkeleton,
  IntegrationNotice,
  IntegrationSection,
  ProviderStateBadges,
  SecretStatusCard,
} from './PaymentIntegrationCommon';

const DEFAULT_VALUES: MomoPaymentIntegrationFormValues = {
  enabled: false,
  environment: '',
  partnerCode: '',
  clearPartnerCode: false,
  accessKey: '',
  clearAccessKey: false,
  secretKey: '',
  clearSecretKey: false,
  createUrl: '',
  redirectUrl: '',
  ipnUrl: '',
  requestType: '',
  lang: '',
  connectTimeoutMs: '',
  readTimeoutMs: '',
};

export function MomoIntegrationCard() {
  const form = useForm<MomoPaymentIntegrationFormValues>({
    resolver: zodResolver(momoPaymentIntegrationSchema),
    defaultValues: DEFAULT_VALUES,
  });
  const integrationQuery = useMomoPaymentIntegration();
  const updateIntegration = useUpdateMomoPaymentIntegration();

  const {
    clearErrors,
    formState: { errors, isDirty },
    setError,
    setValue,
  } = form;

  useEffect(() => {
    if (!integrationQuery.data || isDirty || updateIntegration.isPending) {
      return;
    }

    form.reset(mapMomoIntegrationToFormValues(integrationQuery.data));
  }, [form, integrationQuery.data, isDirty, updateIntegration.isPending]);

  const integration = integrationQuery.data;
  const rootError = errors.root?.server?.message;
  const clearPartnerCode = form.watch('clearPartnerCode');
  const clearAccessKey = form.watch('clearAccessKey');
  const clearSecretKey = form.watch('clearSecretKey');

  const handleClearToggle = (
    secretField: 'partnerCode' | 'accessKey' | 'secretKey',
    clearField: 'clearPartnerCode' | 'clearAccessKey' | 'clearSecretKey',
    checked: boolean,
  ) => {
    setValue(clearField, checked, { shouldDirty: true });
    if (checked) {
      setValue(secretField, '', { shouldDirty: true });
      clearErrors(secretField);
    }
  };

  const handleSubmit = form.handleSubmit(async (values) => {
    clearErrors();

    const payload = buildMomoIntegrationPayload(values, form.formState.dirtyFields);
    if (Object.keys(payload).length === 0) {
      toast.info('No MoMo changes to save.');
      return;
    }

    try {
      const savedIntegration = await updateIntegration.mutateAsync(payload);
      form.reset(mapMomoIntegrationToFormValues(savedIntegration));
      toast.success('MoMo configuration saved.');
    } catch (error) {
      if (error instanceof AppError) {
        if (error.fieldErrors?.length) {
          error.fieldErrors.forEach(({ field, message }) => {
            setError(field as Path<MomoPaymentIntegrationFormValues>, { message });
          });
          return;
        }

        setError('root.server', {
          message: getPhase3AdminErrorMessage(error, 'Failed to save MoMo configuration.'),
        });
        return;
      }

      setError('root.server', { message: 'Failed to save MoMo configuration.' });
    }
  });

  if (integrationQuery.isLoading && !integration) {
    return <IntegrationCardSkeleton />;
  }

  if (integrationQuery.isError || !integration) {
    return (
      <IntegrationCard
        title="MoMo"
        description="Runtime configuration for MoMo order creation, redirects, and IPN callbacks."
      >
        <ErrorCard
          message="Failed to load the MoMo integration configuration."
          onRetry={() => void integrationQuery.refetch()}
        />
      </IntegrationCard>
    );
  }

  return (
    <IntegrationCard
      title="MoMo"
      description="Runtime configuration for MoMo order creation, redirects, and IPN callbacks."
      badges={
        <ProviderStateBadges
          enabled={integration.enabled}
          managedInDatabase={integration.managedInDatabase}
        />
      }
    >
      {!integration.managedInDatabase ? (
        <IntegrationNotice>
          This provider is currently running from backend environment fallback. Saving this form will
          create a DB-managed override, and any blank DB fields can still fall back to backend env values.
        </IntegrationNotice>
      ) : (
        <IntegrationNotice variant="warning">
          This provider is DB-managed. Leaving a secret input blank keeps the current value. Clearing a secret
          removes only the DB override, not any backend env fallback.
        </IntegrationNotice>
      )}

      {rootError && (
        <div className="rounded-xl border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-700">
          {rootError}
        </div>
      )}

      <FormProvider {...form}>
        <form onSubmit={(event) => void handleSubmit(event)} className="space-y-6" noValidate>
          <Controller
            control={form.control}
            name="enabled"
            render={({ field }) => (
              <div className="flex items-center justify-between rounded-xl border border-gray-200 px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">Provider enabled</p>
                  <p className="text-xs text-gray-500">
                    Enabling requires a complete effective config after DB and env merge.
                  </p>
                </div>
                <Toggle
                  checked={field.value}
                  onChange={field.onChange}
                  disabled={updateIntegration.isPending}
                  label={field.value ? 'Enabled' : 'Disabled'}
                />
              </div>
            )}
          />

          <IntegrationSection
            title="Secrets"
            description="Secret values are write-only. Leave the input blank to keep the current value."
          >
            <div className="grid gap-3 md:grid-cols-3">
              <SecretStatusCard label="Partner code" configured={integration.hasPartnerCode} />
              <SecretStatusCard label="Access key" configured={integration.hasAccessKey} />
              <SecretStatusCard label="Secret key" configured={integration.hasSecretKey} />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <FormField
                  name="partnerCode"
                  label="Partner Code"
                  type="password"
                  placeholder="Enter a new partner code"
                  hint={clearPartnerCode ? 'This DB override will be cleared on save.' : 'Leave blank to keep the current value.'}
                  disabled={updateIntegration.isPending || clearPartnerCode}
                  autoComplete="new-password"
                />
                <Controller
                  control={form.control}
                  name="clearPartnerCode"
                  render={({ field }) => (
                    <Checkbox
                      checked={field.value}
                      onChange={(checked) => handleClearToggle('partnerCode', 'clearPartnerCode', checked)}
                      disabled={updateIntegration.isPending || !integration.managedInDatabase}
                      label="Clear DB override on save"
                    />
                  )}
                />
              </div>

              <div className="space-y-2">
                <FormField
                  name="accessKey"
                  label="Access Key"
                  type="password"
                  placeholder="Enter a new access key"
                  hint={clearAccessKey ? 'This DB override will be cleared on save.' : 'Leave blank to keep the current value.'}
                  disabled={updateIntegration.isPending || clearAccessKey}
                  autoComplete="new-password"
                />
                <Controller
                  control={form.control}
                  name="clearAccessKey"
                  render={({ field }) => (
                    <Checkbox
                      checked={field.value}
                      onChange={(checked) => handleClearToggle('accessKey', 'clearAccessKey', checked)}
                      disabled={updateIntegration.isPending || !integration.managedInDatabase}
                      label="Clear DB override on save"
                    />
                  )}
                />
              </div>

              <div className="space-y-2">
                <FormField
                  name="secretKey"
                  label="Secret Key"
                  type="password"
                  placeholder="Enter a new secret key"
                  hint={clearSecretKey ? 'This DB override will be cleared on save.' : 'Leave blank to keep the current value.'}
                  disabled={updateIntegration.isPending || clearSecretKey}
                  autoComplete="new-password"
                />
                <Controller
                  control={form.control}
                  name="clearSecretKey"
                  render={({ field }) => (
                    <Checkbox
                      checked={field.value}
                      onChange={(checked) => handleClearToggle('secretKey', 'clearSecretKey', checked)}
                      disabled={updateIntegration.isPending || !integration.managedInDatabase}
                      label="Clear DB override on save"
                    />
                  )}
                />
              </div>
            </div>
          </IntegrationSection>

          <IntegrationSection
            title="Core settings"
            description="These fields are prefilled with the current effective runtime values."
          >
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                name="environment"
                label="Environment"
                placeholder="e.g. test"
                hint="Use the backend-supported MoMo environment value."
                disabled={updateIntegration.isPending}
              />
              <FormField
                name="requestType"
                label="Request Type"
                placeholder="captureWallet"
                disabled={updateIntegration.isPending}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                name="createUrl"
                label="Create URL"
                placeholder="https://test-payment.momo.vn/v2/gateway/api/create"
                disabled={updateIntegration.isPending}
              />
              <FormField
                name="redirectUrl"
                label="Redirect URL"
                placeholder="https://admin.example.com/payments/momo/return"
                disabled={updateIntegration.isPending}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                name="ipnUrl"
                label="IPN URL"
                placeholder="https://api.example.com/api/v1/payments/callback"
                disabled={updateIntegration.isPending}
              />
              <FormField
                name="lang"
                label="Language"
                placeholder="vi"
                disabled={updateIntegration.isPending}
              />
            </div>
          </IntegrationSection>

          <IntegrationSection
            title="Timeouts"
            description="Leave blank to rely on the backend fallback for timeouts."
          >
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                name="connectTimeoutMs"
                label="Connect Timeout (ms)"
                type="number"
                placeholder="15000"
                disabled={updateIntegration.isPending}
              />
              <FormField
                name="readTimeoutMs"
                label="Read Timeout (ms)"
                type="number"
                placeholder="15000"
                disabled={updateIntegration.isPending}
              />
            </div>
          </IntegrationSection>

          <div className="flex justify-end">
            <Button type="submit" isLoading={updateIntegration.isPending}>
              {updateIntegration.isPending ? 'Saving...' : 'Save MoMo configuration'}
            </Button>
          </div>
        </form>
      </FormProvider>
    </IntegrationCard>
  );
}
