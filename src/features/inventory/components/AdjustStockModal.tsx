import { useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Modal } from '@/shared/components/ui/Modal';
import { Button } from '@/shared/components/ui/Button';
import { FormField } from '@/shared/components/form/FormField';
import { FormSelect } from '@/shared/components/form/FormSelect';
import { adjustStockSchema, type AdjustStockFormValues } from '../schemas/adjustStockSchema';
import type { Warehouse } from '../types/inventory.types';
import { InventoryVariantSelector } from './InventoryVariantSelector';

const MOVEMENT_TYPE_OPTIONS = [
  { value: 'ADJUSTMENT', label: 'Adjustment / Correction' },
  { value: 'EXPORT', label: 'Export / Remove' },
  { value: 'RETURN', label: 'Return' },
];

interface AdjustStockContext {
  warehouseId?: string;
  warehouseName?: string;
  variantId?: string;
  variantSku?: string;
  variantName?: string;
}

interface AdjustStockModalProps {
  open: boolean;
  onClose: () => void;
  context?: AdjustStockContext;
  warehouses: Warehouse[];
  isSubmitting: boolean;
  onSubmit: (values: AdjustStockFormValues) => void;
}

export function AdjustStockModal({
  open,
  onClose,
  context,
  warehouses,
  isSubmitting,
  onSubmit,
}: AdjustStockModalProps) {
  const hasContext = context?.warehouseId !== undefined && context?.variantId !== undefined;

  const warehouseOptions = warehouses.map((warehouse) => ({
    value: warehouse.id,
    label: warehouse.name,
  }));

  const form = useForm<AdjustStockFormValues>({
    resolver: zodResolver(adjustStockSchema),
    defaultValues: {
      warehouseId: '',
      variantId: '',
      quantity: undefined as unknown as number,
      movementType: 'ADJUSTMENT',
      note: '',
    },
  });

  useEffect(() => {
    if (!open) return;

    form.reset({
      warehouseId: context?.warehouseId ?? '',
      variantId: context?.variantId ?? '',
      quantity: undefined as unknown as number,
      movementType: 'ADJUSTMENT',
      note: '',
    });
  }, [context, form, open]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Adjust Stock"
      description="Apply a correction to the current inventory level."
      size="md"
      closeOnBackdropClick={false}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" form="adjust-stock-form" isLoading={isSubmitting}>
            {isSubmitting ? 'Applying...' : 'Apply adjustment'}
          </Button>
        </>
      }
    >
      <FormProvider {...form}>
        <form
          id="adjust-stock-form"
          onSubmit={(event) => {
            void form.handleSubmit(onSubmit)(event);
          }}
          noValidate
        >
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
                <InventoryVariantSelector open={open} disabled={isSubmitting} />
              </>
            )}

            <FormField
              name="quantity"
              label="Adjustment quantity"
              required
              type="number"
              placeholder="e.g. 10"
              hint="Enter the stock quantity to apply for the selected movement type."
              disabled={isSubmitting}
            />
            <FormSelect
              name="movementType"
              label="Movement type"
              required
              options={MOVEMENT_TYPE_OPTIONS}
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
