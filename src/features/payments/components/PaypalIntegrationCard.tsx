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
import { usePaypalPaymentIntegration } from '../hooks/usePaypalPaymentIntegration';
import { useUpdatePaypalPaymentIntegration } from '../hooks/useUpdatePaypalPaymentIntegration';
import {
  paypalPaymentIntegrationSchema,
  type PaypalPaymentIntegrationFormValues,
} from '../schemas/paymentIntegrationSchema';
import {
  buildPaypalIntegrationPayload,
  mapPaypalIntegrationToFormValues,
} from '../utils/paymentIntegrationForm';
import {
  IntegrationCard,
  IntegrationCardSkeleton,
  IntegrationNotice,
  IntegrationSection,
  ProviderStateBadges,
  SecretStatusCard,
} from './PaymentIntegrationCommon';

const DEFAULT_VALUES: PaypalPaymentIntegrationFormValues = {
  enabled: false,
  environment: '',
  clientId: '',
  clearClientId: false,
  clientSecret: '',
  clearClientSecret: false,
  baseUrl: '',
  returnUrl: '',
  cancelUrl: '',
  webhookId: '',
  currency: '',
  brandName: '',
  locale: '',
  userAction: '',
  paymentMethodPreference: '',
  shippingPreference: '',
  testConversionEnabled: false,
  testConversionRateVndToUsd: '',
  connectTimeoutMs: '',
  readTimeoutMs: '',
};

export function PaypalIntegrationCard() {
  const form = useForm<PaypalPaymentIntegrationFormValues>({
    resolver: zodResolver(paypalPaymentIntegrationSchema),
    defaultValues: DEFAULT_VALUES,
  });
  const integrationQuery = usePaypalPaymentIntegration();
  const updateIntegration = useUpdatePaypalPaymentIntegration();

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

    form.reset(mapPaypalIntegrationToFormValues(integrationQuery.data));
  }, [form, integrationQuery.data, isDirty, updateIntegration.isPending]);

  const integration = integrationQuery.data;
  const rootError = errors.root?.server?.message;
  const clearClientId = form.watch('clearClientId');
  const clearClientSecret = form.watch('clearClientSecret');
  const testConversionEnabled = form.watch('testConversionEnabled');

  const handleClearToggle = (
    secretField: 'clientId' | 'clientSecret',
    clearField: 'clearClientId' | 'clearClientSecret',
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

    const payload = buildPaypalIntegrationPayload(values, form.formState.dirtyFields);
    if (Object.keys(payload).length === 0) {
      toast.info('No PayPal changes to save.');
      return;
    }

    try {
      const savedIntegration = await updateIntegration.mutateAsync(payload);
      form.reset(mapPaypalIntegrationToFormValues(savedIntegration));
      toast.success('PayPal configuration saved.');
    } catch (error) {
      if (error instanceof AppError) {
        if (error.fieldErrors?.length) {
          error.fieldErrors.forEach(({ field, message }) => {
            setError(field as Path<PaypalPaymentIntegrationFormValues>, { message });
          });
          return;
        }

        setError('root.server', {
          message: getPhase3AdminErrorMessage(error, 'Failed to save PayPal configuration.'),
        });
        return;
      }

      setError('root.server', { message: 'Failed to save PayPal configuration.' });
    }
  });

  if (integrationQuery.isLoading && !integration) {
    return <IntegrationCardSkeleton />;
  }

  if (integrationQuery.isError || !integration) {
    return (
      <IntegrationCard
        title="PayPal"
        description="Runtime configuration for PayPal order creation, return handling, and sandbox helpers."
      >
        <ErrorCard
          message="Failed to load the PayPal integration configuration."
          onRetry={() => void integrationQuery.refetch()}
        />
      </IntegrationCard>
    );
  }

  return (
    <IntegrationCard
      title="PayPal"
      description="Runtime configuration for PayPal order creation, return handling, and sandbox helpers."
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
          This provider is DB-managed. Leave secret inputs blank to keep their values. Clearing a secret
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
            <div className="grid gap-3 md:grid-cols-2">
              <SecretStatusCard label="Client ID" configured={integration.hasClientId} />
              <SecretStatusCard label="Client Secret" configured={integration.hasClientSecret} />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <FormField
                  name="clientId"
                  label="Client ID"
                  type="password"
                  placeholder="Enter a new client ID"
                  hint={clearClientId ? 'This DB override will be cleared on save.' : 'Leave blank to keep the current value.'}
                  disabled={updateIntegration.isPending || clearClientId}
                  autoComplete="new-password"
                />
                <Controller
                  control={form.control}
                  name="clearClientId"
                  render={({ field }) => (
                    <Checkbox
                      checked={field.value}
                      onChange={(checked) => handleClearToggle('clientId', 'clearClientId', checked)}
                      disabled={updateIntegration.isPending || !integration.managedInDatabase}
                      label="Clear DB override on save"
                    />
                  )}
                />
              </div>

              <div className="space-y-2">
                <FormField
                  name="clientSecret"
                  label="Client Secret"
                  type="password"
                  placeholder="Enter a new client secret"
                  hint={clearClientSecret ? 'This DB override will be cleared on save.' : 'Leave blank to keep the current value.'}
                  disabled={updateIntegration.isPending || clearClientSecret}
                  autoComplete="new-password"
                />
                <Controller
                  control={form.control}
                  name="clearClientSecret"
                  render={({ field }) => (
                    <Checkbox
                      checked={field.value}
                      onChange={(checked) => handleClearToggle('clientSecret', 'clearClientSecret', checked)}
                      disabled={updateIntegration.isPending || !integration.managedInDatabase}
                      label="Clear DB override on save"
                    />
                  )}
                />
              </div>
            </div>
          </IntegrationSection>

          <IntegrationSection
            title="Checkout settings"
            description="These fields are prefilled with the current effective runtime values."
          >
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                name="environment"
                label="Environment"
                placeholder="e.g. sandbox"
                hint="Use the backend-supported PayPal environment value."
                disabled={updateIntegration.isPending}
              />
              <FormField
                name="baseUrl"
                label="Base URL"
                placeholder="https://api-m.sandbox.paypal.com"
                disabled={updateIntegration.isPending}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                name="returnUrl"
                label="Return URL"
                placeholder="https://admin.example.com/payments/paypal/return"
                disabled={updateIntegration.isPending}
              />
              <FormField
                name="cancelUrl"
                label="Cancel URL"
                placeholder="https://admin.example.com/payments/paypal/cancel"
                disabled={updateIntegration.isPending}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                name="currency"
                label="Currency"
                placeholder="USD"
                disabled={updateIntegration.isPending}
              />
              <FormField
                name="webhookId"
                label="Webhook ID"
                placeholder="Optional webhook identifier"
                disabled={updateIntegration.isPending}
              />
            </div>
          </IntegrationSection>

          <IntegrationSection
            title="Experience"
            description="Optional buyer-facing metadata sent to PayPal during checkout."
          >
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                name="brandName"
                label="Brand Name"
                placeholder="Fashion Shop"
                disabled={updateIntegration.isPending}
              />
              <FormField
                name="locale"
                label="Locale"
                placeholder="en-US"
                disabled={updateIntegration.isPending}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <FormField
                name="userAction"
                label="User Action"
                placeholder="PAY_NOW"
                disabled={updateIntegration.isPending}
              />
              <FormField
                name="paymentMethodPreference"
                label="Payment Method Preference"
                placeholder="IMMEDIATE_PAYMENT_REQUIRED"
                disabled={updateIntegration.isPending}
              />
              <FormField
                name="shippingPreference"
                label="Shipping Preference"
                placeholder="SET_PROVIDED_ADDRESS"
                disabled={updateIntegration.isPending}
              />
            </div>
          </IntegrationSection>

          <IntegrationSection
            title="Advanced"
            description="Sandbox conversion helpers and timeout overrides for PayPal runtime behavior."
          >
            <div className="space-y-4 rounded-xl border border-gray-200 bg-gray-50 p-4">
              <Controller
                control={form.control}
                name="testConversionEnabled"
                render={({ field }) => (
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Sandbox VND to USD conversion</p>
                      <p className="text-xs text-gray-500">
                        Use only for test-mode checkout flows that need a temporary conversion rate.
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

              <div className="grid gap-4 md:grid-cols-3">
                <FormField
                  name="testConversionRateVndToUsd"
                  label="Test Conversion Rate"
                  type="number"
                  placeholder="26000"
                  hint={testConversionEnabled ? 'Required only if your backend expects a manual sandbox rate.' : 'Leave blank unless your sandbox flow needs an override.'}
                  disabled={updateIntegration.isPending}
                />
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
            </div>
          </IntegrationSection>

          <div className="flex justify-end">
            <Button type="submit" isLoading={updateIntegration.isPending}>
              {updateIntegration.isPending ? 'Saving...' : 'Save PayPal configuration'}
            </Button>
          </div>
        </form>
      </FormProvider>
    </IntegrationCard>
  );
}
