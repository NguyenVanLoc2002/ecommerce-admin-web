import { useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Modal } from '@/shared/components/ui/Modal';
import { Button } from '@/shared/components/ui/Button';
import { FormField } from '@/shared/components/form/FormField';
import { FormSelect } from '@/shared/components/form/FormSelect';
import { importStockSchema, type ImportStockFormValues } from '../schemas/importStockSchema';
import type { Warehouse } from '../types/inventory.types';

interface ImportStockContext {
  warehouseId?: string;
  warehouseName?: string;
  variantId?: string;
  variantSku?: string;
  variantName?: string;
}

interface ImportStockModalProps {
  open: boolean;
  onClose: () => void;
  context?: ImportStockContext;
  warehouses: Warehouse[];
  isSubmitting: boolean;
  onSubmit: (values: ImportStockFormValues) => void;
}

export function ImportStockModal({
  open,
  onClose,
  context,
  warehouses,
  isSubmitting,
  onSubmit,
}: ImportStockModalProps) {
  const hasContext = context?.warehouseId !== undefined && context?.variantId !== undefined;

  const warehouseOptions = warehouses.map((warehouse) => ({
    value: warehouse.id,
    label: warehouse.name,
  }));

  const form = useForm<ImportStockFormValues>({
    resolver: zodResolver(importStockSchema),
    defaultValues: {
      warehouseId: '',
      variantId: '',
      quantity: undefined as unknown as number,
      note: '',
    },
  });

  useEffect(() => {
    if (!open) return;

    form.reset({
      warehouseId: context?.warehouseId ?? '',
      variantId: context?.variantId ?? '',
      quantity: undefined as unknown as number,
      note: '',
    });
  }, [context, form, open]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Import Stock"
      description="Add inventory to a warehouse."
      size="md"
      closeOnBackdropClick={false}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" form="import-stock-form" isLoading={isSubmitting}>
            {isSubmitting ? 'Importing...' : 'Import'}
          </Button>
        </>
      }
    >
      <FormProvider {...form}>
        <form id="import-stock-form" onSubmit={form.handleSubmit(onSubmit)} noValidate>
          <div className="space-y-4">
            {hasContext ? (
              <>
                <div className="space-y-1 rounded-md bg-gray-50 px-4 py-3 text-sm">
                  <p className="text-gray-500">
                    Warehouse:{' '}
                    <span className="font-medium text-gray-800">{context?.warehouseName}</span>
                  </p>
                  <p className="text-gray-500">
                    Variant:{' '}
                    <span className="font-medium text-gray-800">
                      {context?.variantSku} - {context?.variantName}
                    </span>
                  </p>
                </div>
                <input type="hidden" {...form.register('warehouseId')} />
                <input type="hidden" {...form.register('variantId')} />
              </>
            ) : (
              <>
                <FormSelect
                  name="warehouseId"
                  label="Warehouse"
                  required
                  options={[{ value: '', label: 'Select warehouse...' }, ...warehouseOptions]}
                  disabled={isSubmitting}
                />
                <FormField
                  name="variantId"
                  label="Variant ID"
                  required
                  placeholder="Enter variant UUID"
                  hint="Find the variant UUID on the Product Variants page."
                  disabled={isSubmitting}
                />
              </>
            )}

            <FormField
              name="quantity"
              label="Quantity"
              required
              type="number"
              placeholder="e.g. 50"
              disabled={isSubmitting}
            />
            <FormField
              name="note"
              label="Note"
              multiline
              rows={2}
              placeholder="Optional note..."
              disabled={isSubmitting}
            />
          </div>
        </form>
      </FormProvider>
    </Modal>
  );
}
