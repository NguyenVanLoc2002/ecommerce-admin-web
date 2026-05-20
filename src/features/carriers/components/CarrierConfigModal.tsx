import { useEffect } from 'react';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Modal } from '@/shared/components/ui/Modal';
import { Button } from '@/shared/components/ui/Button';
import { Badge } from '@/shared/components/ui/Badge';
import { Toggle } from '@/shared/components/ui/Toggle';
import { FormField } from '@/shared/components/form/FormField';
import { AppError } from '@/shared/types/api.types';
import { carrierConfigSchema, type CarrierConfigFormValues } from '../schemas/carrierConfigSchema';
import type { Carrier } from '../types/carrier.types';

interface CarrierConfigModalProps {
  open: boolean;
  onClose: () => void;
  carrier?: Carrier;
  isSubmitting: boolean;
  onSubmit: (values: CarrierConfigFormValues) => Promise<void>;
  inline?: boolean;
}

function SecretState({
  label,
  saved,
}: {
  label: string;
  saved: boolean;
}) {
  return (
    <div className="flex items-center justify-between rounded-md border border-gray-200 bg-gray-50 px-3 py-2">
      <span className="text-sm text-gray-600">{label}</span>
      <Badge variant={saved ? 'success' : 'default'}>{saved ? 'Saved' : 'Not saved'}</Badge>
    </div>
  );
}

export function CarrierConfigModal({
  open,
  onClose,
  carrier,
  isSubmitting,
  onSubmit,
  inline = false,
}: CarrierConfigModalProps) {
  const form = useForm<CarrierConfigFormValues>({
    resolver: zodResolver(carrierConfigSchema),
    defaultValues: {
      apiKey: null,
      secretKey: null,
      webhookSecret: null,
      baseUrl: null,
      enabled: false,
      configJson: null,
    },
  });

  const {
    clearErrors,
    formState: { errors },
    setError,
  } = form;

  useEffect(() => {
    if (!open) {
      return;
    }

    clearErrors();
    form.reset({
      apiKey: null,
      secretKey: null,
      webhookSecret: null,
      baseUrl: carrier?.baseUrl ?? null,
      enabled: carrier?.configEnabled ?? false,
      configJson: carrier?.configJson ?? null,
    });
  }, [carrier, clearErrors, form, open]);

  const rootError = errors.root?.server?.message;

  const handleSubmit = form.handleSubmit(async (values) => {
    clearErrors();

    try {
      await onSubmit(values);
    } catch (error) {
      if (error instanceof AppError) {
        if (error.fieldErrors?.length) {
          error.fieldErrors.forEach(({ field, message }) => {
            setError(field as never, { message });
          });
          return;
        }

        setError('root.server', { message: error.message });
        return;
      }

      setError('root.server', { message: 'Failed to save carrier configuration. Please try again.' });
    }
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={carrier ? `Configure ${carrier.name}` : 'Configure Carrier'}
      description="Legacy configuration fallback for providers that do not yet have a structured setup drawer."
      size="xl"
      inline={inline}
      closeOnBackdropClick={false}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" form="carrier-config-form" isLoading={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save configuration'}
          </Button>
        </>
      }
    >
      <FormProvider {...form}>
        <form id="carrier-config-form" onSubmit={handleSubmit} noValidate>
          <div className="space-y-5">
            {rootError && (
              <div className="rounded-md border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-700">
                {rootError}
              </div>
            )}

            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <SecretState label="API key" saved={carrier?.hasApiKey ?? false} />
              <SecretState label="Secret key" saved={carrier?.hasSecretKey ?? false} />
              <SecretState label="Webhook secret" saved={carrier?.hasWebhookSecret ?? false} />
            </div>

            <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
              Leave a secret field empty to keep the current stored value. The backend will never
              return raw secret values to this UI.
            </div>

            <div className="rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-600">
              Carrier catalog status and config enabled are separate controls. A carrier can stay
              active in the catalog while its provider config remains disabled.
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                name="apiKey"
                label="API Key"
                type="password"
                placeholder="Enter a new API key"
                disabled={isSubmitting}
              />
              <FormField
                name="secretKey"
                label="Secret Key"
                type="password"
                placeholder="Enter a new secret key"
                disabled={isSubmitting}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                name="webhookSecret"
                label="Webhook Secret"
                type="password"
                placeholder="Enter a new webhook secret"
                disabled={isSubmitting}
              />
              <FormField
                name="baseUrl"
                label="Base URL"
                placeholder="https://api.example.com"
                disabled={isSubmitting}
              />
            </div>

            <Controller
              control={form.control}
              name="enabled"
              render={({ field }) => (
                <div className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Config enabled</p>
                    <p className="text-xs text-gray-500">
                      Shipment creation can use this carrier when its config is enabled.
                    </p>
                  </div>
                  <Toggle
                    checked={field.value}
                    onChange={field.onChange}
                    disabled={isSubmitting}
                    label={field.value ? 'Enabled' : 'Disabled'}
                  />
                </div>
              )}
            />

            <FormField
              name="configJson"
              label="Config JSON"
              multiline
              rows={8}
              placeholder='{"shopId":"...", "region":"HCM"}'
              hint="Optional provider-specific JSON config. Must be valid JSON."
              disabled={isSubmitting}
            />
          </div>
        </form>
      </FormProvider>
    </Modal>
  );
}
