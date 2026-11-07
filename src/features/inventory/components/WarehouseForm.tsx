import { useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Modal } from '@/shared/components/ui/Modal';
import { Button } from '@/shared/components/ui/Button';
import { FormField } from '@/shared/components/form/FormField';
import { FormSelect } from '@/shared/components/form/FormSelect';
import { warehouseSchema, type WarehouseFormValues } from '../schemas/warehouseSchema';
import type { Warehouse } from '../types/inventory.types';

const STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
];

interface WarehouseFormProps {
  open: boolean;
  onClose: () => void;
  warehouse?: Warehouse;
  isSubmitting: boolean;
  onSubmit: (values: WarehouseFormValues) => void;
}

export function WarehouseForm({
  open,
  onClose,
  warehouse,
  isSubmitting,
  onSubmit,
}: WarehouseFormProps) {
  const isEditMode = warehouse !== undefined;

  const form = useForm<WarehouseFormValues>({
    resolver: zodResolver(warehouseSchema),
    defaultValues: {
      name: '', code: '', location: '', status: 'ACTIVE', pickupAddress: '', pickupShortAddress: '',
      pickupContactName: '', pickupContactPhone: '', pickupLat: '', pickupLng: '',
    },
  });

  useEffect(() => {
    if (open) {
      if (warehouse) {
        form.reset({
          name: warehouse.name,
          code: warehouse.code,
          location: warehouse.location ?? '',
          pickupAddress: warehouse.pickupAddress ?? '',
          pickupShortAddress: warehouse.pickupShortAddress ?? '',
          pickupContactName: warehouse.pickupContactName ?? '',
          pickupContactPhone: warehouse.pickupContactPhone ?? '',
          pickupLat: warehouse.pickupLat == null ? '' : String(warehouse.pickupLat),
          pickupLng: warehouse.pickupLng == null ? '' : String(warehouse.pickupLng),
          status: warehouse.status,
        });
      } else {
        form.reset({
          name: '', code: '', location: '', status: 'ACTIVE', pickupAddress: '', pickupShortAddress: '',
          pickupContactName: '', pickupContactPhone: '', pickupLat: '', pickupLng: '',
        });
      }
    }
  }, [open, warehouse, form]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEditMode ? 'Edit Warehouse' : 'New Warehouse'}
      size="md"
      closeOnBackdropClick={false}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" form="warehouse-form" isLoading={isSubmitting}>
            {isSubmitting ? 'Saving…' : isEditMode ? 'Save changes' : 'Create'}
          </Button>
        </>
      }
    >
      <FormProvider {...form}>
        <form
          id="warehouse-form"
          onSubmit={(event) => {
            void form.handleSubmit(onSubmit)(event);
          }}
          noValidate
        >
          <div className="space-y-4">
            <FormField
              name="name"
              label="Name"
              required
              placeholder="e.g. Main Warehouse"
              disabled={isSubmitting}
            />
            <div className="border-t border-gray-200 pt-4">
              <h3 className="text-sm font-semibold text-gray-900">Managed pickup profile</h3>
              <p className="mt-1 text-sm text-gray-500">
                Used when this warehouse is selected as an AhaMove pickup source. Address, contact, and coordinates are required at shipment time.
              </p>
            </div>
            <FormField name="pickupAddress" label="Pickup address" multiline rows={2} disabled={isSubmitting} />
            <FormField name="pickupShortAddress" label="Pickup short address" disabled={isSubmitting} />
            <div className="grid gap-4 md:grid-cols-2">
              <FormField name="pickupContactName" label="Pickup contact name" disabled={isSubmitting} />
              <FormField name="pickupContactPhone" label="Pickup contact phone" disabled={isSubmitting} />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <FormField name="pickupLat" label="Pickup latitude" placeholder="10.77689" disabled={isSubmitting} />
              <FormField name="pickupLng" label="Pickup longitude" placeholder="106.70081" disabled={isSubmitting} />
            </div>
            {isEditMode ? (
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-700">Code</p>
                <div className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-mono text-gray-700">
                  {warehouse.code}
                </div>
              </div>
            ) : (
              <FormField
                name="code"
                label="Code"
                required
                placeholder="e.g. KHO-HN-01"
                disabled={isSubmitting}
              />
            )}
            <FormField
              name="location"
              label="Location"
              multiline
              rows={2}
              placeholder="Street address, city…"
              disabled={isSubmitting}
            />
            {isEditMode && (
              <FormSelect
                name="status"
                label="Status"
                required
                options={STATUS_OPTIONS}
                disabled={isSubmitting}
              />
            )}
          </div>
        </form>
      </FormProvider>
    </Modal>
  );
}
