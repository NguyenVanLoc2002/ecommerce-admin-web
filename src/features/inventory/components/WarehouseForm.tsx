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
    defaultValues: { name: '', code: '', location: '', status: 'ACTIVE' },
  });

  useEffect(() => {
    if (open) {
      if (warehouse) {
        form.reset({
          name: warehouse.name,
          code: warehouse.code,
          location: warehouse.location ?? '',
          status: warehouse.status,
        });
      } else {
        form.reset({ name: '', code: '', location: '', status: 'ACTIVE' });
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
        <form id="warehouse-form" onSubmit={form.handleSubmit(onSubmit)} noValidate>
          <div className="space-y-4">
            <FormField
              name="name"
              label="Name"
              required
              placeholder="e.g. Main Warehouse"
              disabled={isSubmitting}
            />
            <FormField
              name="code"
              label="Code"
              required
              placeholder="e.g. KHO-HN-01"
              disabled={isSubmitting || isEditMode}
            />
            <FormField
              name="location"
              label="Location"
              multiline
              rows={2}
              placeholder="Street address, city…"
              disabled={isSubmitting}
            />
            <FormSelect
              name="status"
              label="Status"
              required
              options={STATUS_OPTIONS}
              disabled={isSubmitting}
            />
          </div>
        </form>
      </FormProvider>
    </Modal>
  );
}
