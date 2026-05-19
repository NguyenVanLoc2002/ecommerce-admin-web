import { useEffect } from 'react';
import { Controller, FormProvider, useForm, type Path } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Modal } from '@/shared/components/ui/Modal';
import { Button } from '@/shared/components/ui/Button';
import { Badge } from '@/shared/components/ui/Badge';
import { Select } from '@/shared/components/ui/Select';
import { FormField } from '@/shared/components/form/FormField';
import { useActiveCarrierOptions } from '@/features/carriers/hooks/useActiveCarrierOptions';
import { AppError } from '@/shared/types/api.types';
import { cn } from '@/shared/utils/cn';
import { formatEnumLabel } from '@/shared/utils/formatEnumLabel';
import {
  createShipmentSchema,
  type CreateShipmentFormValues,
} from '../schemas/createShipmentSchema';
import type { Shipment } from '../types/shipment.types';

interface ShipmentEditModalProps {
  open: boolean;
  onClose: () => void;
  shipment: Shipment;
  isSubmitting: boolean;
  onSubmit: (values: CreateShipmentFormValues) => Promise<void>;
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

export function ShipmentEditModal({
  open,
  onClose,
  shipment,
  isSubmitting,
  onSubmit,
}: ShipmentEditModalProps) {
  const form = useForm<CreateShipmentFormValues>({
    resolver: zodResolver(createShipmentSchema),
    defaultValues: {
      orderId: shipment.orderId,
      carrierMode: shipment.carrierId ? 'configured' : 'manual',
      carrierId: shipment.carrierId,
      carrier: shipment.carrier,
      trackingNumber: shipment.trackingNumber,
      estimatedDeliveryDate: shipment.estimatedDeliveryDate,
      shippingFee: shipment.shippingFee === null ? null : String(shipment.shippingFee),
      notes: shipment.note,
    },
  });
  const {
    clearErrors,
    formState: { errors },
    setError,
    watch,
  } = form;
  const carrierMode = watch('carrierMode');
  const selectedCarrierId = watch('carrierId');
  const { data: carrierOptionsData, isLoading: carriersLoading } = useActiveCarrierOptions();
  const carrierOptions = carrierOptionsData?.items ?? [];
  const selectedCarrier = carrierOptions.find((carrier) => carrier.id === selectedCarrierId);
  const rootError = errors.root?.server?.message;

  useEffect(() => {
    if (!open) {
      return;
    }

    clearErrors();
    form.reset({
      orderId: shipment.orderId,
      carrierMode: shipment.carrierId ? 'configured' : 'manual',
      carrierId: shipment.carrierId,
      carrier: shipment.carrier,
      trackingNumber: shipment.trackingNumber,
      estimatedDeliveryDate: shipment.estimatedDeliveryDate,
      shippingFee: shipment.shippingFee === null ? null : String(shipment.shippingFee),
      notes: shipment.note,
    });
  }, [clearErrors, form, open, shipment]);

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

      setError('root.server', { message: 'Failed to update shipment. Please try again.' });
    }
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Edit Shipment Details"
      description="Switch between a configured carrier flow and manual carrier entry without changing shipment status."
      size="lg"
      closeOnBackdropClick={false}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" form="shipment-edit-form" isLoading={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save changes'}
          </Button>
        </>
      }
    >
      <FormProvider {...form}>
        <form id="shipment-edit-form" onSubmit={handleSubmit} noValidate>
          <div className="space-y-4">
            {rootError && (
              <div className="rounded-md border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-700">
                {rootError}
              </div>
            )}

            <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
              <p className="text-sm font-medium text-gray-900">Order</p>
              <p className="mt-1 font-mono text-xs text-gray-500">{shipment.orderCode}</p>
            </div>

            <Controller
              control={form.control}
              name="carrierMode"
              render={({ field }) => (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Carrier mode</label>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <ModeButton
                      active={field.value === 'configured'}
                      title="Use configured carrier"
                      description="Pick an active carrier record and let the backend use its saved provider config."
                      onClick={() => field.onChange('configured')}
                    />
                    <ModeButton
                      active={field.value === 'manual'}
                      title="Manual carrier"
                      description="Keep the legacy flow and enter the carrier name yourself."
                      onClick={() => field.onChange('manual')}
                    />
                  </div>
                </div>
              )}
            />

            {carrierMode === 'configured' ? (
              <Controller
                control={form.control}
                name="carrierId"
                render={({ field, fieldState }) => (
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="shipment-edit-carrier-id" className="text-sm font-medium text-gray-700">
                      Carrier
                      <span className="ml-0.5 text-danger-500">*</span>
                    </label>
                    <Select
                      id="shipment-edit-carrier-id"
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
                        Active carriers are loaded from the carrier catalog. Disabled config entries stay visible but cannot be selected.
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
                placeholder="e.g. Viettel Post"
                hint="Use the manual carrier flow when no configured provider should be called."
                disabled={isSubmitting}
              />
            )}

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                name="trackingNumber"
                label="Tracking Number"
                placeholder={
                  carrierMode === 'configured'
                    ? 'Leave blank to let the backend generate one when supported'
                    : 'e.g. VT123456789VN'
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
                placeholder="Leave blank to keep the current shipment fee"
                disabled={isSubmitting}
              />
            </div>

            <FormField
              name="notes"
              label="Notes"
              multiline
              rows={4}
              placeholder="Internal notes about this shipment..."
              disabled={isSubmitting}
            />
          </div>
        </form>
      </FormProvider>
    </Modal>
  );
}
