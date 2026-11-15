import { useEffect } from 'react';
import { useForm, FormProvider, type Path } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/shared/components/ui/Button';
import { AppError } from '@/shared/types/api.types';
import { FormField } from '@/shared/components/form/FormField';
import { FormSelect } from '@/shared/components/form/FormSelect';
import { warehouseSchema, type WarehouseFormValues } from '../schemas/warehouseSchema';
import type { Warehouse } from '../types/inventory.types';

const STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
];

interface WarehouseFormProps {
  warehouse?: Warehouse;
  isSubmitting: boolean;
  onCancel: () => void;
  onSubmit: (values: WarehouseFormValues) => Promise<void>;
  onDirtyChange: (isDirty: boolean) => void;
}

export function WarehouseForm({ warehouse, isSubmitting, onCancel, onSubmit, onDirtyChange }: WarehouseFormProps) {
  const isEditMode = warehouse !== undefined;
  const form = useForm<WarehouseFormValues>({
    resolver: zodResolver(warehouseSchema),
    defaultValues: {
      name: '', code: '', location: '', status: 'ACTIVE', pickupAddress: '', pickupShortAddress: '',
      pickupContactName: '', pickupContactPhone: '', pickupLat: '', pickupLng: '',
    },
  });
  const { isDirty } = form.formState;
  const handleSubmit = form.handleSubmit(async (values) => {
    form.clearErrors('root.server');
    try {
      await onSubmit(values);
    } catch (error) {
      if (error instanceof AppError && error.fieldErrors?.length) {
        error.fieldErrors.forEach(({ field, message }) => form.setError(field as Path<WarehouseFormValues>, { message }));
        return;
      }
      form.setError('root.server', { message: error instanceof AppError ? error.message : 'Failed to save warehouse. Please try again.' });
    }
  });

  useEffect(() => {
    form.reset(warehouse ? {
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
    } : {
      name: '', code: '', location: '', status: 'ACTIVE', pickupAddress: '', pickupShortAddress: '',
      pickupContactName: '', pickupContactPhone: '', pickupLat: '', pickupLng: '',
    });
  }, [form, warehouse]);

  useEffect(() => onDirtyChange(isDirty), [isDirty, onDirtyChange]);

  return (
    <FormProvider {...form}>
      <form onSubmit={(event) => { void handleSubmit(event); }} noValidate className="space-y-6">
        {form.formState.errors.root?.server?.message && <p role="alert" className="rounded-md border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-700">{form.formState.errors.root.server.message}</p>}
        <section className="space-y-4 rounded-lg border border-gray-200 bg-white p-5">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Warehouse information</h2>
            <p className="mt-1 text-sm text-gray-500">Identity and storage location used by inventory operations.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <FormField name="name" label="Name" required placeholder="e.g. Main Warehouse" disabled={isSubmitting} />
            {isEditMode ? (
              <div className="space-y-1"><p className="text-sm font-medium text-gray-700">Code</p><div className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-mono text-gray-700">{warehouse.code}</div></div>
            ) : <FormField name="code" label="Code" required placeholder="e.g. KHO-HN-01" disabled={isSubmitting} />}
            <FormField name="location" label="Location" multiline rows={2} placeholder="Street address, city…" disabled={isSubmitting} />
            {isEditMode && <FormSelect name="status" label="Status" required options={STATUS_OPTIONS} disabled={isSubmitting} />}
          </div>
        </section>

        <section className="space-y-4 rounded-lg border border-gray-200 bg-white p-5">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Pickup profile</h2>
            <p className="mt-1 text-sm text-gray-500">Used when this warehouse is selected as a carrier pickup source. Address, contact, and coordinates are required at shipment time.</p>
          </div>
          <FormField name="pickupAddress" label="Pickup address" multiline rows={2} disabled={isSubmitting} />
          <FormField name="pickupShortAddress" label="Pickup short address" disabled={isSubmitting} />
          <div className="grid gap-4 md:grid-cols-2">
            <FormField name="pickupContactName" label="Pickup contact name" disabled={isSubmitting} />
            <FormField name="pickupContactPhone" label="Pickup contact phone" disabled={isSubmitting} />
            <FormField name="pickupLat" label="Pickup latitude" placeholder="10.77689" disabled={isSubmitting} />
            <FormField name="pickupLng" label="Pickup longitude" placeholder="106.70081" disabled={isSubmitting} />
          </div>
        </section>

        <div className="sticky bottom-0 flex justify-end gap-3 border-t border-gray-200 bg-gray-50/95 py-4 backdrop-blur">
          <Button type="button" variant="secondary" onClick={onCancel} disabled={isSubmitting}>Cancel</Button>
          <Button type="submit" isLoading={isSubmitting}>{isSubmitting ? 'Saving…' : isEditMode ? 'Save changes' : 'Create warehouse'}</Button>
        </div>
      </form>
    </FormProvider>
  );
}
