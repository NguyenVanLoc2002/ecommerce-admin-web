import { useEffect, useRef, useState } from 'react';
import { Controller, FormProvider, useForm, type Path } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CircleAlert, ExternalLink, RefreshCw, ShieldCheck, ShieldEllipsis, Webhook } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { Badge } from '@/shared/components/ui/Badge';
import { CopyValueButton } from '@/shared/components/ui/CopyValueButton';
import { Drawer } from '@/shared/components/ui/Drawer';
import { Modal } from '@/shared/components/ui/Modal';
import { Spinner } from '@/shared/components/ui/Spinner';
import { Toggle } from '@/shared/components/ui/Toggle';
import { FormField } from '@/shared/components/form/FormField';
import { cleanParams } from '@/shared/utils/cleanParams';
import { formatDateTime, formatDateTimeSeconds } from '@/shared/utils/formatDate';
import { toast } from '@/shared/stores/uiStore';
import { AppError } from '@/shared/types/api.types';
import { getPhase3AdminErrorMessage } from '@/shared/utils/adminPhase3Errors';
import { useAhamoveIntegration } from '../hooks/useAhamoveIntegration';
import { useAhamoveWebhookSetup } from '../hooks/useAhamoveWebhookSetup';
import { useGenerateAhamoveWebhookToken } from '../hooks/useGenerateAhamoveWebhookToken';
import { useTestAhamoveConnection } from '../hooks/useTestAhamoveConnection';
import { useUpdateAhamoveIntegration } from '../hooks/useUpdateAhamoveIntegration';
import {
  ahamoveIntegrationSchema,
  type AhamoveIntegrationFormValues,
} from '../schemas/ahamoveIntegrationSchema';
import type {
  AhamoveConnectionTestResponse,
  AhamoveIntegration,
  AhamoveWebhookTokenResponse,
  Carrier,
  TestAhamoveConnectionRequest,
  UpdateAhamoveIntegrationRequest,
} from '../types/carrier.types';
import { CarrierConnectionBadge } from './CarrierConnectionBadge';

interface AhamoveIntegrationDrawerProps {
  open: boolean;
  onClose: () => void;
  carrier?: Carrier;
}

const DEFAULT_FORM_VALUES: AhamoveIntegrationFormValues = {
  apiKey: null,
  secretKey: null,
  webhookSecret: null,
  baseUrl: null,
  enabled: false,
  phone: null,
  brandName: null,
  pickupAddress: null,
  pickupShortAddress: null,
  pickupName: null,
  pickupPhone: null,
  pickupLat: null,
  pickupLng: null,
  defaultServiceCode: null,
  defaultPaymentMethod: null,
};

function mapIntegrationToFormValues(integration: AhamoveIntegration): AhamoveIntegrationFormValues {
  return {
    apiKey: null,
    secretKey: null,
    webhookSecret: null,
    baseUrl: integration.baseUrl ?? null,
    enabled: integration.enabled,
    phone: integration.phone ?? null,
    brandName: integration.brandName ?? null,
    pickupAddress: integration.pickupAddress ?? null,
    pickupShortAddress: integration.pickupShortAddress ?? null,
    pickupName: integration.pickupName ?? null,
    pickupPhone: integration.pickupPhone ?? null,
    pickupLat: integration.pickupLat == null ? null : String(integration.pickupLat),
    pickupLng: integration.pickupLng == null ? null : String(integration.pickupLng),
    defaultServiceCode: integration.defaultServiceCode ?? null,
    defaultPaymentMethod: integration.defaultPaymentMethod ?? null,
  };
}

function buildSavePayload(values: AhamoveIntegrationFormValues): UpdateAhamoveIntegrationRequest {
  return cleanParams({
    apiKey: values.apiKey,
    secretKey: values.secretKey,
    webhookSecret: values.webhookSecret,
    baseUrl: values.baseUrl,
    enabled: values.enabled,
    phone: values.phone,
    brandName: values.brandName,
    pickupAddress: values.pickupAddress,
    pickupShortAddress: values.pickupShortAddress,
    pickupName: values.pickupName,
    pickupPhone: values.pickupPhone,
    pickupLat: values.pickupLat == null ? undefined : Number(values.pickupLat),
    pickupLng: values.pickupLng == null ? undefined : Number(values.pickupLng),
    defaultServiceCode: values.defaultServiceCode,
    defaultPaymentMethod: values.defaultPaymentMethod,
  }) as UpdateAhamoveIntegrationRequest;
}

function buildTestPayload(
  values: AhamoveIntegrationFormValues,
  integration: AhamoveIntegration | undefined,
): TestAhamoveConnectionRequest {
  const normalizedBaseUrl = values.baseUrl?.trim() || null;
  const normalizedPhone = values.phone?.trim() || null;

  return cleanParams({
    apiKey: values.apiKey,
    baseUrl:
      normalizedBaseUrl && normalizedBaseUrl !== (integration?.baseUrl ?? null)
        ? normalizedBaseUrl
        : undefined,
    phone:
      normalizedPhone && normalizedPhone !== (integration?.phone ?? null)
        ? normalizedPhone
        : undefined,
  }) as TestAhamoveConnectionRequest;
}

function Section({
  title,
  description,
  children,
  accent,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  accent?: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white">
      <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-5 py-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
          <p className="mt-1 text-sm text-gray-500">{description}</p>
        </div>
        {accent}
      </div>
      <div className="space-y-4 px-5 py-4">{children}</div>
    </section>
  );
}

function SecretState({
  label,
  saved,
  detail,
}: {
  label: string;
  saved: boolean;
  detail?: string | null;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-gray-800">{label}</p>
          {detail && <p className="mt-1 font-mono text-xs text-gray-500">{detail}</p>}
        </div>
        <Badge variant={saved ? 'success' : 'default'}>{saved ? 'Saved' : 'Not saved'}</Badge>
      </div>
    </div>
  );
}

function ValueRow({
  label,
  value,
  action,
}: {
  label: string;
  value: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-gray-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-[0.08em] text-gray-500">{label}</p>
        <div className="mt-1 min-w-0 break-all text-sm text-gray-900">{value}</div>
      </div>
      {action}
    </div>
  );
}

function ResultPanel({
  result,
}: {
  result: AhamoveConnectionTestResponse;
}) {
  const isSuccess = result.success && result.status === 'CONNECTED';

  return (
    <div
      className={[
        'rounded-xl border px-4 py-3',
        isSuccess
          ? 'border-success-200 bg-success-50'
          : 'border-danger-200 bg-danger-50',
      ].join(' ')}
    >
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant={isSuccess ? 'success' : 'danger'} dot>
          {isSuccess ? 'Connection succeeded' : 'Connection failed'}
        </Badge>
        <Badge variant="default">{result.status}</Badge>
      </div>
      <p className="mt-3 text-sm text-gray-800">{result.message}</p>
      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.08em] text-gray-500">Resolved base URL</p>
          <p className="mt-1 break-all text-sm text-gray-800">{result.resolvedBaseUrl ?? 'Not resolved'}</p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.08em] text-gray-500">Resolved phone</p>
          <p className="mt-1 text-sm text-gray-800">{result.resolvedPhone ?? 'Not resolved'}</p>
        </div>
      </div>
    </div>
  );
}

export function AhamoveIntegrationDrawer({
  open,
  onClose,
  carrier,
}: AhamoveIntegrationDrawerProps) {
  const form = useForm<AhamoveIntegrationFormValues>({
    resolver: zodResolver(ahamoveIntegrationSchema),
    defaultValues: DEFAULT_FORM_VALUES,
  });
  const [testResult, setTestResult] = useState<AhamoveConnectionTestResponse | null>(null);
  const [showSetupInstructions, setShowSetupInstructions] = useState(false);
  const [tokenResponse, setTokenResponse] = useState<AhamoveWebhookTokenResponse | null>(null);
  const [tokenModalOpen, setTokenModalOpen] = useState(false);
  const initializedCarrierIdRef = useRef<string | null>(null);

  const integrationQuery = useAhamoveIntegration(carrier?.id, open && carrier?.providerType === 'AHAMOVE');
  const webhookSetupQuery = useAhamoveWebhookSetup(
    carrier?.id,
    open && carrier?.providerType === 'AHAMOVE' && showSetupInstructions,
  );
  const updateAhamoveIntegration = useUpdateAhamoveIntegration();
  const testAhamoveConnection = useTestAhamoveConnection();
  const generateWebhookToken = useGenerateAhamoveWebhookToken();

  const {
    clearErrors,
    formState: { errors },
    setError,
  } = form;

  useEffect(() => {
    if (open) {
      return;
    }

    initializedCarrierIdRef.current = null;
    setShowSetupInstructions(false);
    setTestResult(null);
    setTokenResponse(null);
    setTokenModalOpen(false);
    clearErrors();
    form.reset(DEFAULT_FORM_VALUES);
  }, [clearErrors, form, open]);

  useEffect(() => {
    const integration = integrationQuery.data;
    if (!open || !carrier || !integration) {
      return;
    }

    if (initializedCarrierIdRef.current === carrier.id) {
      return;
    }

    form.reset(mapIntegrationToFormValues(integration));
    initializedCarrierIdRef.current = carrier.id;
  }, [carrier, form, integrationQuery.data, open]);

  const rootError = errors.root?.server?.message;
  const integration = integrationQuery.data;
  const rawWebhookToken = tokenResponse?.token ?? null;

  const handleSave = form.handleSubmit(async (values) => {
    if (!carrier) {
      return;
    }

    clearErrors();

    try {
      const savedIntegration = await updateAhamoveIntegration.mutateAsync({
        id: carrier.id,
        body: buildSavePayload(values),
      });
      form.reset(mapIntegrationToFormValues(savedIntegration));
      initializedCarrierIdRef.current = carrier.id;
      toast.success('AhaMove configuration saved.');
    } catch (error) {
      if (error instanceof AppError) {
        if (error.fieldErrors?.length) {
          error.fieldErrors.forEach(({ field, message }) => {
            setError(field as Path<AhamoveIntegrationFormValues>, { message });
          });
          return;
        }

        setError('root.server', {
          message: getPhase3AdminErrorMessage(error, 'Failed to save AhaMove configuration.'),
        });
        return;
      }

      setError('root.server', { message: 'Failed to save AhaMove configuration.' });
    }
  });

  const handleTestConnection = async () => {
    if (!carrier) {
      return;
    }

    clearErrors('root.server');

    const validationPassed = await form.trigger(['apiKey', 'baseUrl', 'phone']);
    if (!validationPassed) {
      return;
    }

    try {
      const result = await testAhamoveConnection.mutateAsync({
        id: carrier.id,
        body: buildTestPayload(form.getValues(), integration),
      });
      setTestResult(result);
      toast.success(result.success ? 'Connection test finished.' : 'Connection test failed.');
    } catch (error) {
      const message =
        error instanceof AppError
          ? getPhase3AdminErrorMessage(error, 'Failed to test the AhaMove connection.')
          : 'Failed to test the AhaMove connection.';

      setTestResult({
        success: false,
        status: 'FAILED',
        message,
        resolvedBaseUrl: null,
        resolvedPhone: null,
      });
    }
  };

  const handleGenerateToken = async () => {
    if (!carrier) {
      return;
    }

    try {
      const nextToken = await generateWebhookToken.mutateAsync(carrier.id);
      setTokenResponse(nextToken);
      setTokenModalOpen(true);
      setShowSetupInstructions(true);
      toast.success('Webhook token generated.');
    } catch (error) {
      const message =
        error instanceof AppError
          ? getPhase3AdminErrorMessage(error, 'Failed to generate a webhook token.')
          : 'Failed to generate a webhook token.';

      toast.error(message);
    }
  };

  const isBusy =
    updateAhamoveIntegration.isPending ||
    testAhamoveConnection.isPending ||
    generateWebhookToken.isPending;
  const canManageIntegration = Boolean(carrier && integration);

  return (
    <>
      <Drawer
        open={open}
        onClose={onClose}
        title={carrier ? `Configure ${carrier.name}` : 'Configure AhaMove'}
        description="Structured AhaMove setup with write-only secrets, health checks, and webhook onboarding."
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={onClose} disabled={isBusy}>
              Close
            </Button>
            <Button
              onClick={() => void handleSave()}
              isLoading={updateAhamoveIntegration.isPending}
              disabled={!canManageIntegration}
            >
              Save configuration
            </Button>
          </>
        }
      >
        {!carrier ? null : (
          <FormProvider {...form}>
            <div className="space-y-5">
              {integrationQuery.isLoading && !integration ? (
                <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-4 text-sm text-gray-600">
                  <Spinner size="sm" />
                  Loading AhaMove integration settings...
                </div>
              ) : null}

              {integrationQuery.isError && !integration ? (
                <div className="rounded-xl border border-danger-200 bg-danger-50 px-4 py-4 text-sm text-danger-700">
                  Unable to load the AhaMove integration settings for this carrier.
                </div>
              ) : null}

              {rootError && (
                <div className="rounded-xl border border-danger-200 bg-danger-50 px-4 py-4 text-sm text-danger-700">
                  {rootError}
                </div>
              )}

              <div className="rounded-2xl border border-gray-200 bg-slate-950 px-5 py-5 text-slate-100">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={carrier.status === 'ACTIVE' ? 'success' : 'default'} dot>
                    Catalog {carrier.status === 'ACTIVE' ? 'active' : 'inactive'}
                  </Badge>
                  <Badge variant={integration?.enabled ? 'success' : 'warning'} dot>
                    Config {integration?.enabled ? 'enabled' : 'disabled'}
                  </Badge>
                  <CarrierConnectionBadge status={integration?.connectionStatus ?? carrier.connectionStatus} />
                </div>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.08em] text-slate-400">
                      Catalog status
                    </p>
                    <p className="mt-1 text-sm text-slate-100">
                      Controls whether staff can select this provider in the shipping catalog.
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.08em] text-slate-400">
                      Config enabled
                    </p>
                    <p className="mt-1 text-sm text-slate-100">
                      Controls whether provider-backed shipment calls may use the saved AhaMove config.
                    </p>
                  </div>
                </div>
              </div>

              <Section
                title="Provider credentials"
                description="Secrets stay write-only. Leave any secret blank to keep the saved backend value."
                accent={<ShieldEllipsis className="mt-1 h-4 w-4 text-gray-400" />}
              >
                <div className="grid gap-3 md:grid-cols-2">
                  <SecretState label="API key" saved={integration?.hasApiKey ?? carrier.hasApiKey} />
                  <SecretState label="Secret key" saved={integration?.hasSecretKey ?? carrier.hasSecretKey} />
                  <SecretState
                    label="Webhook secret"
                    saved={integration?.hasWebhookSecret ?? carrier.hasWebhookSecret}
                    detail={integration?.maskedWebhookToken}
                  />
                </div>

                <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
                  Secret values are never returned by the backend. This form can only replace them.
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    name="apiKey"
                    label="API key"
                    type="password"
                    placeholder="Leave blank to keep the saved key"
                    disabled={isBusy}
                  />
                  <FormField
                    name="secretKey"
                    label="Secret key"
                    type="password"
                    placeholder="Leave blank to keep the saved secret"
                    disabled={isBusy}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    name="webhookSecret"
                    label="Webhook secret"
                    type="password"
                    placeholder="Leave blank to keep the saved webhook secret"
                    disabled={isBusy}
                  />
                  <FormField
                    name="baseUrl"
                    label="Base URL"
                    placeholder="https://partner-apistg.ahamove.com"
                    disabled={isBusy}
                    hint="Use the exact AhaMove API base URL configured for this environment."
                  />
                </div>

                <Controller
                  control={form.control}
                  name="enabled"
                  render={({ field }) => (
                    <div className="flex items-center justify-between rounded-xl border border-gray-200 px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-gray-900">Enable AhaMove shipments</p>
                        <p className="mt-1 text-sm text-gray-500">
                          Disable this if the catalog entry should remain visible while provider-backed calls stay off.
                        </p>
                      </div>
                      <Toggle
                        checked={field.value}
                        onChange={field.onChange}
                        disabled={isBusy}
                        label={field.value ? 'Enabled' : 'Disabled'}
                      />
                    </div>
                  )}
                />
              </Section>

              <Section
                title="Pickup defaults"
                description="These values are used to mint tokens and create shipment requests without requiring raw JSON."
                accent={<ShieldCheck className="mt-1 h-4 w-4 text-gray-400" />}
              >
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    name="phone"
                    label="Account phone"
                    placeholder="84338710667"
                    disabled={isBusy}
                    hint="Provider account phone used when AhaMove mints a bearer token."
                  />
                  <FormField
                    name="brandName"
                    label="Brand name"
                    placeholder="Locen Studio"
                    disabled={isBusy}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    name="pickupAddress"
                    label="Pickup address"
                    placeholder="Full pickup address"
                    disabled={isBusy}
                  />
                  <FormField
                    name="pickupShortAddress"
                    label="Pickup short address"
                    placeholder="District or short landmark"
                    disabled={isBusy}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    name="pickupName"
                    label="Pickup contact name"
                    placeholder="Warehouse contact"
                    disabled={isBusy}
                  />
                  <FormField
                    name="pickupPhone"
                    label="Pickup contact phone"
                    placeholder="Contact phone"
                    disabled={isBusy}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    name="pickupLat"
                    label="Pickup latitude"
                    placeholder="10.77689"
                    disabled={isBusy}
                  />
                  <FormField
                    name="pickupLng"
                    label="Pickup longitude"
                    placeholder="106.70081"
                    disabled={isBusy}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    name="defaultServiceCode"
                    label="Default service code"
                    placeholder="BIKE"
                    disabled={isBusy}
                    hint="Use the exact service code expected by the backend runtime."
                  />
                  <FormField
                    name="defaultPaymentMethod"
                    label="Default payment method"
                    placeholder="CASH"
                    disabled={isBusy}
                  />
                </div>
              </Section>

              <Section
                title="Connection health"
                description="Run a safe token-mint test against the saved config, or include current edits for API key, base URL, and account phone."
                accent={<RefreshCw className="mt-1 h-4 w-4 text-gray-400" />}
              >
                <div className="grid gap-3 md:grid-cols-3">
                  <ValueRow
                    label="Connection status"
                    value={<CarrierConnectionBadge status={integration?.connectionStatus ?? carrier.connectionStatus} />}
                  />
                  <ValueRow
                    label="Last health check"
                    value={
                      integration?.lastHealthCheckAt || carrier.lastHealthCheckAt
                        ? formatDateTime(integration?.lastHealthCheckAt ?? carrier.lastHealthCheckAt ?? '')
                        : 'Not checked yet'
                    }
                  />
                  <ValueRow
                    label="Resolved error"
                    value={integration?.lastHealthCheckError ?? carrier.lastHealthCheckError ?? 'No recent error'}
                  />
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => void handleTestConnection()}
                    isLoading={testAhamoveConnection.isPending}
                    disabled={!canManageIntegration}
                    leftIcon={<RefreshCw className="h-4 w-4" />}
                  >
                    Test connection
                  </Button>
                  <p className="text-sm text-gray-500">
                    Blank secret fields keep using the current saved credentials for the test.
                  </p>
                </div>

                {testResult && <ResultPanel result={testResult} />}
              </Section>

              <Section
                title="Webhook setup"
                description="Generate the partner token and copy the exact setup values the AhaMove portal expects."
                accent={<Webhook className="mt-1 h-4 w-4 text-gray-400" />}
              >
                <div className="grid gap-3 md:grid-cols-2">
                  <SecretState
                    label="Webhook token"
                    saved={integration?.hasWebhookSecret ?? carrier.hasWebhookSecret}
                    detail={integration?.maskedWebhookToken}
                  />
                  <div className="rounded-xl border border-warning-200 bg-warning-50 px-4 py-3 text-sm text-warning-800">
                    The webhook token must match the value configured in the AhaMove partner portal.
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => void handleGenerateToken()}
                    isLoading={generateWebhookToken.isPending}
                    disabled={!canManageIntegration}
                  >
                    Generate token
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setShowSetupInstructions((current) => !current)}
                    disabled={!canManageIntegration}
                  >
                    {showSetupInstructions ? 'Hide setup instructions' : 'View setup instructions'}
                  </Button>
                </div>

                {showSetupInstructions && webhookSetupQuery.isLoading && (
                  <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-4 text-sm text-gray-600">
                    <Spinner size="sm" />
                    Loading webhook setup instructions...
                  </div>
                )}

                {showSetupInstructions && webhookSetupQuery.isError && (
                  <div className="rounded-xl border border-danger-200 bg-danger-50 px-4 py-4 text-sm text-danger-700">
                    Unable to load the webhook setup instructions for this carrier.
                  </div>
                )}

                {showSetupInstructions && webhookSetupQuery.data && (
                  <div className="space-y-3">
                    <ValueRow
                      label="Webhook URL"
                      value={webhookSetupQuery.data.webhookUrl}
                      action={<CopyValueButton value={webhookSetupQuery.data.webhookUrl} label="Copy URL" />}
                    />
                    <ValueRow label="Auth header" value={webhookSetupQuery.data.authHeader} />
                    {webhookSetupQuery.data.authScheme && (
                      <ValueRow label="Auth scheme" value={webhookSetupQuery.data.authScheme} />
                    )}
                    <ValueRow
                      label="Masked token"
                      value={webhookSetupQuery.data.maskedWebhookToken ?? 'No token saved'}
                      action={
                        rawWebhookToken ? (
                          <CopyValueButton value={rawWebhookToken} label="Copy token" />
                        ) : undefined
                      }
                    />

                    <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-4">
                      <div className="flex items-center gap-2 text-sm font-medium text-gray-800">
                        <ExternalLink className="h-4 w-4 text-gray-400" />
                        Setup checklist
                      </div>
                      <ol className="mt-3 space-y-2 text-sm text-gray-600">
                        {webhookSetupQuery.data.instructions.map((instruction, index) => (
                          <li key={instruction} className="flex gap-3">
                            <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white text-xs font-semibold text-gray-700">
                              {index + 1}
                            </span>
                            <span>{instruction}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  </div>
                )}
              </Section>

              {carrier.configJson && (
                <details className="rounded-2xl border border-gray-200 bg-gray-50">
                  <summary className="cursor-pointer list-none px-5 py-4 text-sm font-semibold text-gray-900">
                    Advanced debug data
                  </summary>
                  <div className="border-t border-gray-200 px-5 py-4">
                    <div className="mb-3 flex items-start gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-600">
                      <CircleAlert className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
                      <p>
                        `configJson` is legacy compatibility data mirrored by the backend. It is read-only here and not required for normal AhaMove onboarding.
                      </p>
                    </div>
                    <pre className="max-h-72 overflow-auto rounded-xl bg-slate-950 px-4 py-4 text-xs text-slate-100">
                      {carrier.configJson}
                    </pre>
                  </div>
                </details>
              )}
            </div>
          </FormProvider>
        )}
      </Drawer>

      <Modal
        open={tokenModalOpen}
        onClose={() => setTokenModalOpen(false)}
        title="Webhook token generated"
        description="Copy this token now. The backend will not return the raw value again."
        size="lg"
        footer={
          <>
            {rawWebhookToken && <CopyValueButton value={rawWebhookToken} label="Copy token" />}
            <Button onClick={() => setTokenModalOpen(false)}>Close</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="rounded-xl border border-warning-200 bg-warning-50 px-4 py-4 text-sm text-warning-800">
            The raw webhook token is shown exactly once in this modal. Close the drawer or refresh the page and only the masked version will remain.
          </div>

          <div className="rounded-xl border border-gray-200 px-4 py-4">
            <p className="text-xs font-medium uppercase tracking-[0.08em] text-gray-500">Raw token</p>
            <p className="mt-2 break-all font-mono text-sm text-gray-900">{rawWebhookToken}</p>
          </div>

          {tokenResponse && (
            <div className="grid gap-3 md:grid-cols-2">
              <ValueRow label="Masked token" value={tokenResponse.maskedToken ?? 'Not available'} />
              <ValueRow label="Generated at" value={formatDateTimeSeconds(tokenResponse.generatedAt)} />
            </div>
          )}
        </div>
      </Modal>
    </>
  );
}
