import { useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Modal } from '@/shared/components/ui/Modal';
import { Button } from '@/shared/components/ui/Button';
import { FormField } from '@/shared/components/form/FormField';
import { FormSelect } from '@/shared/components/form/FormSelect';
import { AttributeEditor } from './AttributeEditor';
import { variantSchema, type VariantFormValues } from '../schemas/variantSchema';
import type { ProductVariant } from '../types/product.types';

const STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
];

interface VariantFormProps {
  open: boolean;
  onClose: () => void;
  variant?: ProductVariant;
  isSubmitting: boolean;
  onSubmit: (values: VariantFormValues) => void;
}

function attributesToEntries(attributes: Array<{ attributeName: string; value: string }>) {
  return attributes.map(({ attributeName, value }) => ({ key: attributeName, value }));
}

export function VariantForm({
  open,
  onClose,
  variant,
  isSubmitting,
  onSubmit,
}: VariantFormProps) {
  const isEditMode = variant !== undefined;

  const form = useForm<VariantFormValues>({
    resolver: zodResolver(variantSchema),
    defaultValues: {
      sku: '',
      name: '',
      price: undefined,
      salePrice: null,
      weight: null,
      dimensions: null,
      status: 'ACTIVE',
      attributes: [],
    },
  });

  useEffect(() => {
    if (open) {
      if (variant) {
        form.reset({
          sku: variant.sku,
          name: variant.variantName,
          price: variant.basePrice,
          salePrice: variant.salePrice ?? null,
          weight: variant.weightGram ?? null,
          dimensions: null,
          status: variant.status,
          attributes: attributesToEntries(variant.attributes ?? []),
        });
      } else {
        form.reset({
          sku: '',
          name: '',
          price: undefined,
          salePrice: null,
          weight: null,
          dimensions: null,
          status: 'ACTIVE',
          attributes: [],
        });
      }
    }
  }, [open, variant, form]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEditMode ? 'Edit Variant' : 'Add Variant'}
      size="lg"
      closeOnBackdropClick={false}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="variant-form"
            isLoading={isSubmitting}
          >
            {isSubmitting ? 'Saving…' : isEditMode ? 'Save changes' : 'Add variant'}
          </Button>
        </>
      }
    >
      <FormProvider {...form}>
        <form id="variant-form" onSubmit={form.handleSubmit(onSubmit)} noValidate>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                name="sku"
                label="SKU"
                required
                placeholder="e.g. SHIRT-WHT-M"
                disabled={isSubmitting}
              />
              <FormField
                name="name"
                label="Variant name"
                required
                placeholder="e.g. White / M"
                disabled={isSubmitting}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                name="price"
                label="Price"
                required
                type="number"
                placeholder="0"
                disabled={isSubmitting}
              />
              <FormField
                name="salePrice"
                label="Sale price"
                type="number"
                placeholder="Leave empty for no sale"
                hint="Must not exceed regular price."
                disabled={isSubmitting}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                name="weight"
                label="Weight (g)"
                type="number"
                placeholder="Optional"
                disabled={isSubmitting}
              />
              <FormField
                name="dimensions"
                label="Dimensions"
                placeholder="e.g. 30x20x5 cm"
                disabled={isSubmitting}
              />
            </div>

            <FormSelect
              name="status"
              label="Status"
              required
              options={STATUS_OPTIONS}
              disabled={isSubmitting}
            />

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Attributes</label>
              <p className="text-xs text-gray-400">
                Key-value pairs like Color=White, Size=M.
              </p>
              <AttributeEditor />
            </div>
          </div>
        </form>
      </FormProvider>
    </Modal>
  );
}
