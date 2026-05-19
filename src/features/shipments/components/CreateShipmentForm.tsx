import { useEffect } from 'react';
import { Controller, FormProvider, useForm, type Path } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useBeforeUnload } from '@/shared/hooks/useBeforeUnload';
import { useActiveCarrierOptions } from '@/features/carriers/hooks/useActiveCarrierOptions';
import { Badge } from '@/shared/components/ui/Badge';
import { Button } from '@/shared/components/ui/Button';
import { Select } from '@/shared/components/ui/Select';
import { FormField } from '@/shared/components/form/FormField';
import { formatMoney } from '@/shared/utils/formatMoney';
import { AppError } from '@/shared/types/api.types';
import { cn } from '@/shared/utils/cn';
import { formatEnumLabel } from '@/shared/utils/formatEnumLabel';
import {
  createShipmentSchema,
  type CreateShipmentFormValues,
} from '../schemas/createShipmentSchema';
import type { ShipmentOrderReference } from '../types/shipment.types';

const DEFAULT_VALUES: CreateShipmentFormValues = {
  orderId: '',
  carrierMode: 'manual',
  carrierId: null,
  carrier: null,
  trackingNumber: null,
  estimatedDeliveryDate: null,
  shippingFee: null,
  notes: null,
};

interface CreateShipmentFormProps {
  defaultOrderId?: string;
  order?: ShipmentOrderReference;
  orderLoading?: boolean;
  isSubmitting: boolean;
  onSubmit: (values: CreateShipmentFormValues) => Promise<void>;
  onCancel: () => void;
}

function ModeButton({
  active,
  title,
  description,
  onClick,
}: {
  active: boolean;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-lg border px-4 py-3 text-left transition-colors',
        active
          ? 'border-primary-500 bg-primary-50'
          : 'border-gray-200 bg-white hover:border-gray-300',
      )}
    >
      <p className="text-sm font-semibold text-gray-900">{title}</p>
      <p className="mt-1 text-xs text-gray-500">{description}</p>
    </button>
  );
}

export function CreateShipmentForm({
  defaultOrderId,
  order,
  orderLoading = false,
  isSubmitting,
  onSubmit,
  onCancel,
}: CreateShipmentFormProps) {
  const hasOrderCarrierSnapshot = Boolean(order?.carrierId || order?.carrierName);
  const form = useForm<CreateShipmentFormValues>({
    resolver: zodResolver(createShipmentSchema),
    defaultValues: {
      ...DEFAULT_VALUES,
      orderId: defaultOrderId ?? '',
      carrierMode: hasOrderCarrierSnapshot ? 'orderSnapshot' : 'manual',
    },
  });
  const {
    clearErrors,
    formState: { errors },
    reset,
    setError,
    watch,
  } = form;
  const carrierMode = watch('carrierMode');
  const selectedCarrierId = watch('carrierId');
  const { data: carrierOptionsData, isLoading: carriersLoading } = useActiveCarrierOptions();
  const carrierOptions = carrierOptionsData?.items ?? [];
  const selectedCarrier = carrierOptions.find((carrier) => carrier.id === selectedCarrierId);
  const rootError = errors.root?.server?.message;

  useBeforeUnload(form.formState.isDirty, 'Leave without creating the shipment?');

  useEffect(() => {
    const currentValues = form.getValues();
    const shouldPromoteToSnapshotMode =
      Boolean(defaultOrderId) &&
      hasOrderCarrierSnapshot &&
      currentValues.carrierMode === 'manual' &&
      !currentValues.carrier &&
      !currentValues.carrierId;

    reset({
      ...currentValues,
      orderId: defaultOrderId ?? currentValues.orderId,
      carrierMode:
        currentValues.carrierMode === 'orderSnapshot' && !hasOrderCarrierSnapshot
          ? 'manual'
          : shouldPromoteToSnapshotMode
            ? 'orderSnapshot'
          : currentValues.carrierMode === 'configured' || currentValues.carrierMode === 'manual'
            ? currentValues.carrierMode
            : hasOrderCarrierSnapshot
              ? 'orderSnapshot'
              : 'manual',
    });
  }, [defaultOrderId, form, hasOrderCarrierSnapshot, reset]);

  const handleSubmit = form.handleSubmit(async (values) => {
    clearErrors();

    try {
      await onSubmit(values);
    } catch (error) {
      if (error instanceof AppError) {
        if (error.fieldErrors?.length) {
          error.fieldErrors.forEach(({ field, message }) => {
            setError(field as Path<CreateShipmentFormValues>, { message });
          });
          return;
        }

        setError('root.server', { message: error.message });
        return;
      }

      setError('root.server', { message: 'Failed to create shipment. Please try again.' });
    }
  });

  return (
    <FormProvider {...form}>
      <form
        onSubmit={(event) => {
          if (isSubmitting) {
            event.preventDefault();
            return;
          }

          void handleSubmit(event);
        }}
        noValidate
      >
        <div className="space-y-5">
          {rootError && (
            <div className="rounded-md border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-700">
              {rootError}
            </div>
          )}

          <div>
            <h3 className="mb-4 text-sm font-semibold text-gray-900">Order</h3>
            <FormField
              name="orderId"
              label="Order ID"
              required
              placeholder="Enter order UUID"
              hint="Enter the UUID of the order to ship."
              disabled={isSubmitting || Boolean(defaultOrderId)}
            />
          </div>

          <div className="border-t border-gray-100 pt-5">
            <h3 className="mb-4 text-sm font-semibold text-gray-900">Carrier &amp; Tracking</h3>
            <div className="space-y-4">
              <Controller
                control={form.control}
                name="carrierMode"
                render={({ field }) => (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Carrier mode</label>
                    <div className={cn('grid grid-cols-1 gap-3', hasOrderCarrierSnapshot ? 'md:grid-cols-3' : 'md:grid-cols-2')}>
                      {hasOrderCarrierSnapshot && (
                        <ModeButton
                          active={field.value === 'orderSnapshot'}
                          title="Reuse checkout carrier"
                          description="Submit without an explicit carrier override and let the backend reuse the order snapshot."
                          onClick={() => field.onChange('orderSnapshot')}
                        />
                      )}
                      <ModeButton
                        active={field.value === 'configured'}
                        title="Use configured carrier"
                        description="Pick an active carrier record and let the backend use its saved provider config."
                        onClick={() => field.onChange('configured')}
                      />
                      <ModeButton
                        active={field.value === 'manual'}
                        title="Manual carrier"
                        description="Keep the existing manual carrier flow and type the carrier name yourself."
                        onClick={() => field.onChange('manual')}
                      />
                    </div>
                  </div>
                )}
              />

              {carrierMode === 'orderSnapshot' && order ? (
                <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium text-gray-900">
                      {order.carrierName ?? 'Checkout carrier snapshot'}
                    </span>
                    {order.carrierCode && <Badge variant="default">{order.carrierCode}</Badge>}
                    {order.carrierProviderType && (
                      <Badge variant="info">{formatEnumLabel(order.carrierProviderType)}</Badge>
                    )}
                  </div>
                  <p className="mt-2 text-xs text-gray-500">
                    The backend will resolve the carrier from this order when you leave carrier fields blank.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-3 text-xs text-gray-600">
                    <span>Order #{order.orderCode}</span>
                    <span>Checkout shipping fee {formatMoney(order.shippingFee)}</span>
                    {orderLoading && <span>Refreshing order snapshot...</span>}
                  </div>
                </div>
              ) : carrierMode === 'configured' ? (
                <Controller
                  control={form.control}
                  name="carrierId"
                  render={({ field, fieldState }) => (
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="shipment-carrier-select" className="text-sm font-medium text-gray-700">
                        Carrier
                        <span className="ml-0.5 text-danger-500">*</span>
                      </label>
                      <Select
                        id="shipment-carrier-select"
                        value={field.value ?? ''}
                        onChange={(event) => field.onChange(event.target.value || null)}
                        error={Boolean(fieldState.error)}
                        disabled={isSubmitting}
                        options={[
                          { value: '', label: carriersLoading ? 'Loading carriers...' : 'Select a carrier' },
                          ...carrierOptions.map((carrier) => ({
                            value: carrier.id,
                            label: `${carrier.name} (${formatEnumLabel(carrier.providerType)})${carrier.configEnabled ? '' : ' - config disabled'}`,
                            disabled: !carrier.configEnabled,
                          })),
                        ]}
                      />
                      {selectedCarrier && (
                        <div className="flex flex-wrap gap-2 pt-1">
                          <Badge variant="info">{formatEnumLabel(selectedCarrier.providerType)}</Badge>
                          <Badge variant={selectedCarrier.configEnabled ? 'success' : 'warning'}>
                            {selectedCarrier.configEnabled ? 'Config enabled' : 'Config disabled'}
                          </Badge>
                        </div>
                      )}
                      {!fieldState.error && (
                        <p className="text-xs text-gray-500">
                          Active carriers come from the carrier catalog. Unconfigured ones remain visible but cannot be selected here.
                        </p>
                      )}
                      {fieldState.error && (
                        <p className="text-xs text-danger-600">{fieldState.error.message}</p>
                      )}
                    </div>
                  )}
                />
              ) : (
                <FormField
                  name="carrier"
                  label="Carrier"
                  required
                  placeholder="e.g. ViettelPost, GHTK, GHN"
                  hint="Manual carrier name for the legacy shipment flow."
                  disabled={isSubmitting}
                />
              )}

              <FormField
                name="trackingNumber"
                label="Tracking Number"
                placeholder={
                  carrierMode === 'configured'
                    ? 'Leave blank to let the backend generate one when supported'
                    : 'e.g. VT123456789VN'
                }
                hint={
                  carrierMode === 'configured'
                    ? 'Some provider-backed carriers can generate tracking and carrier shipment IDs automatically.'
                    : 'Manual shipments keep the existing tracking-number flow.'
                }
                disabled={isSubmitting}
              />
              <FormField
                name="estimatedDeliveryDate"
                label="Estimated Delivery"
                type="date"
                disabled={isSubmitting}
              />
              <FormField
                name="shippingFee"
                label="Shipping Fee"
                type="number"
                placeholder="Leave blank to keep backend defaults"
                hint="Optional override for the shipment shipping fee."
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="border-t border-gray-100 pt-5">
            <FormField
              name="notes"
              label="Notes"
              placeholder="Internal notes about this shipment..."
              multiline
              rows={3}
              disabled={isSubmitting}
            />
          </div>

          <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Shipment'}
            </Button>
          </div>
        </div>
      </form>
    </FormProvider>
  );
}
