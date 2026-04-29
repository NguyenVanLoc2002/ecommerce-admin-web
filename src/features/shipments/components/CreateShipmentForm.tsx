import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/shared/components/ui/Button';
import { FormField } from '@/shared/components/form/FormField';
import { useBeforeUnload } from '@/shared/hooks/useBeforeUnload';
import { createShipmentSchema, type CreateShipmentFormValues } from '../schemas/createShipmentSchema';

const DEFAULT_VALUES: CreateShipmentFormValues = {
  orderId: '',
  carrier: null,
  trackingNumber: null,
  estimatedDeliveryDate: null,
  notes: null,
};

interface CreateShipmentFormProps {
  isSubmitting: boolean;
  onSubmit: (values: CreateShipmentFormValues) => void;
  onCancel: () => void;
}

export function CreateShipmentForm({
  isSubmitting,
  onSubmit,
  onCancel,
}: CreateShipmentFormProps) {
  const form = useForm<CreateShipmentFormValues>({
    resolver: zodResolver(createShipmentSchema),
    defaultValues: DEFAULT_VALUES,
  });

  useBeforeUnload(form.formState.isDirty, 'Leave without creating the shipment?');

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
        <div className="space-y-5">
          <div>
            <h3 className="mb-4 text-sm font-semibold text-gray-900">Order</h3>
            <FormField
              name="orderId"
              label="Order ID"
              required
              placeholder="Enter order UUID"
              hint="Enter the UUID of the order to ship."
            />
          </div>

          <div className="border-t border-gray-100 pt-5">
            <h3 className="mb-4 text-sm font-semibold text-gray-900">Carrier &amp; Tracking</h3>
            <div className="space-y-4">
              <FormField
                name="carrier"
                label="Carrier"
                placeholder="e.g. ViettelPost, GHTK, GHN"
                hint="Shipping carrier name."
              />
              <FormField
                name="trackingNumber"
                label="Tracking Code"
                placeholder="e.g. VT123456789VN"
                hint="Carrier tracking number."
              />
              <FormField
                name="estimatedDeliveryDate"
                label="Estimated Delivery"
                type="date"
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
