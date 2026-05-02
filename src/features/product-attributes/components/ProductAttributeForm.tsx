import { useEffect } from 'react';
import { useFieldArray, useForm, FormProvider, type Path } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Trash2 } from 'lucide-react';
import { Modal } from '@/shared/components/ui/Modal';
import { Button } from '@/shared/components/ui/Button';
import { FormField } from '@/shared/components/form/FormField';
import { FormSelect } from '@/shared/components/form/FormSelect';
import { AppError } from '@/shared/types/api.types';
import { Input } from '@/shared/components/ui/Input';
import { productAttributeSchema, type ProductAttributeFormValues } from '../schemas/productAttributeSchema';
import { ProductAttributeType, type ProductAttribute } from '../types/productAttribute.types';

const TYPE_OPTIONS = [
  { value: ProductAttributeType.VARIANT, label: 'Variant' },
  { value: ProductAttributeType.DESCRIPTIVE, label: 'Descriptive' },
];

interface ProductAttributeFormProps {
  open: boolean;
  onClose: () => void;
  attribute?: ProductAttribute;
  isSubmitting: boolean;
  onSubmit: (values: ProductAttributeFormValues) => Promise<void>;
}

function normalizeFieldPath(field: string): string {
  return field.replace(/\[(\d+)\]/g, '.$1');
}

export function ProductAttributeForm({
  open,
  onClose,
  attribute,
  isSubmitting,
  onSubmit,
}: ProductAttributeFormProps) {
  const isEditMode = attribute !== undefined;

  const form = useForm<ProductAttributeFormValues>({
    resolver: zodResolver(productAttributeSchema),
    defaultValues: {
      name: '',
      code: '',
      type: ProductAttributeType.VARIANT,
      values: [],
    },
  });

  const {
    control,
    register,
    formState: { errors },
    setError,
    clearErrors,
  } = form;

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'values',
  });

  useEffect(() => {
    if (!open) {
      return;
    }

    clearErrors();

    if (attribute) {
      form.reset({
        name: attribute.name,
        code: attribute.code,
        type: attribute.type,
        values: attribute.values.map((value) => ({
          id: value.id,
          value: value.value,
          displayValue: value.displayValue ?? '',
        })),
      });
      return;
    }

    form.reset({
      name: '',
      code: '',
      type: ProductAttributeType.VARIANT,
      values: [],
    });
  }, [attribute, clearErrors, form, open]);

  const rootError = errors.root?.server?.message;

  const handleSubmit = form.handleSubmit(async (values) => {
    clearErrors();

    try {
      await onSubmit(values);
    } catch (error) {
      if (error instanceof AppError) {
        if (error.code === 'PRODUCT_ATTRIBUTE_CODE_ALREADY_EXISTS') {
          setError('code', { message: 'This code already exists.' });
          return;
        }

        if (error.fieldErrors?.length) {
          error.fieldErrors.forEach(({ field, message }) => {
            setError(normalizeFieldPath(field) as Path<ProductAttributeFormValues>, { message });
          });
          return;
        }

        setError('root.server', { message: error.message });
        return;
      }

      setError('root.server', { message: 'Failed to save product attribute. Please try again.' });
    }
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEditMode ? 'Edit Product Attribute' : 'New Product Attribute'}
      description="Manage reusable attribute definitions and the allowed values under each one."
      size="xl"
      closeOnBackdropClick={false}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" form="product-attribute-form" isLoading={isSubmitting}>
            {isSubmitting ? 'Saving…' : isEditMode ? 'Save changes' : 'Create attribute'}
          </Button>
        </>
      }
    >
      <FormProvider {...form}>
        <form id="product-attribute-form" onSubmit={handleSubmit} noValidate>
          <div className="max-h-[70vh] space-y-6 overflow-y-auto pr-1">
            {rootError && (
              <div className="rounded-md border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-700">
                {rootError}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <FormField
                name="name"
                label="Name"
                required
                placeholder="e.g. Color"
                disabled={isSubmitting}
              />
              <FormField
                name="code"
                label="Code"
                required
                placeholder="e.g. COLOR"
                hint="The backend normalizes codes to upper snake-case."
                disabled={isSubmitting}
              />
            </div>

            <FormSelect
              name="type"
              label="Type"
              required
              options={TYPE_OPTIONS}
              disabled={isSubmitting}
            />

            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">Values</h3>
                  <p className="mt-1 text-xs text-gray-500">
                    Add the reusable values that admins can select for this attribute.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => append({ value: '', displayValue: '' })}
                  disabled={isSubmitting}
                  leftIcon={<Plus className="h-4 w-4" />}
                >
                  Add value
                </Button>
              </div>

              <div className="mt-4 space-y-3">
                {fields.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-gray-300 px-4 py-6 text-sm text-gray-500">
                    No values yet. Add options like White, Black, Navy, or XL.
                  </div>
                ) : (
                  fields.map((field, index) => {
                    const valueError = errors.values?.[index]?.value?.message;
                    const displayValueError = errors.values?.[index]?.displayValue?.message;

                    return (
                      <div
                        key={field.id}
                        className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] gap-3 rounded-lg border border-gray-200 p-4"
                      >
                        <div className="space-y-1.5">
                          <label
                            htmlFor={`values.${index}.value`}
                            className="text-sm font-medium text-gray-700"
                          >
                            Value
                            <span className="ml-0.5 text-danger-500">*</span>
                          </label>
                          <Input
                            id={`values.${index}.value`}
                            placeholder="e.g. WHITE"
                            disabled={isSubmitting}
                            error={Boolean(valueError)}
                            {...register(`values.${index}.value`)}
                          />
                          {valueError && (
                            <p className="text-xs text-danger-600">{valueError}</p>
                          )}
                        </div>

                        <div className="space-y-1.5">
                          <label
                            htmlFor={`values.${index}.displayValue`}
                            className="text-sm font-medium text-gray-700"
                          >
                            Display value
                          </label>
                          <Input
                            id={`values.${index}.displayValue`}
                            placeholder="e.g. White"
                            disabled={isSubmitting}
                            error={Boolean(displayValueError)}
                            {...register(`values.${index}.displayValue`)}
                          />
                          {displayValueError && (
                            <p className="text-xs text-danger-600">{displayValueError}</p>
                          )}
                        </div>

                        <div className="flex items-start pt-7">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => remove(index)}
                            disabled={isSubmitting}
                            aria-label="Remove value"
                            className="text-gray-400 hover:text-danger-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </form>
      </FormProvider>
    </Modal>
  );
}
