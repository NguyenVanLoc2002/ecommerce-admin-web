import { useEffect } from 'react';
import { useFieldArray, useForm, FormProvider, type Path } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { FormField } from '@/shared/components/form/FormField';
import { FormSelect } from '@/shared/components/form/FormSelect';
import { AppError } from '@/shared/types/api.types';
import { Input } from '@/shared/components/ui/Input';
import { useBeforeUnload } from '@/shared/hooks/useBeforeUnload';
import { productAttributeSchema, type ProductAttributeFormValues } from '../schemas/productAttributeSchema';
import { ProductAttributeType, type ProductAttribute } from '../types/productAttribute.types';

const TYPE_OPTIONS = [
  { value: ProductAttributeType.VARIANT, label: 'Variant' },
  { value: ProductAttributeType.DESCRIPTIVE, label: 'Descriptive' },
];

interface ProductAttributeFormProps {
  attribute?: ProductAttribute;
  isSubmitting: boolean;
  onSubmit: (values: ProductAttributeFormValues) => Promise<void>;
  onDirtyChange?: (isDirty: boolean) => void;
}

function normalizeFieldPath(field: string): string {
  return field.replace(/\[(\d+)\]/g, '.$1');
}

export function ProductAttributeForm({
  attribute,
  isSubmitting,
  onSubmit,
  onDirtyChange,
}: ProductAttributeFormProps) {
  const form = useForm<ProductAttributeFormValues>({
    resolver: zodResolver(productAttributeSchema),
    defaultValues: {
      name: attribute?.name ?? '',
      code: attribute?.code ?? '',
      type: attribute?.type ?? ProductAttributeType.VARIANT,
      values: attribute?.values.map((value) => ({
        id: value.id,
        value: value.value,
        displayValue: value.displayValue ?? '',
      })) ?? [],
    },
  });

  const {
    control,
    register,
    formState: { errors, isDirty },
    setError,
    clearErrors,
  } = form;

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'values',
  });

  useEffect(() => {
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
  }, [attribute, clearErrors, form]);

  useBeforeUnload(isDirty);

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  useEffect(() => () => onDirtyChange?.(false), [onDirtyChange]);

  const rootError = errors.root?.server?.message;

  const handleSubmit = form.handleSubmit(async (values) => {
    clearErrors();

    try {
      await onSubmit(values);
      form.reset(values);
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
    <FormProvider {...form}>
      <form id="product-attribute-form" onSubmit={(event) => void handleSubmit(event)} noValidate>
        <div className="space-y-6">
            {rootError && (
              <div className="rounded-md border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-700">
                {rootError}
              </div>
            )}

          <section className="rounded-xl border border-gray-200 bg-white p-6">
            <div className="mb-6 border-b border-gray-100 pb-5">
              <h2 className="text-base font-semibold text-gray-900">Attribute definition</h2>
              <p className="mt-1 text-sm text-gray-500">
                Set the reusable attribute name, system code, and where it can be used.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
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

            <div className="grid gap-4 sm:grid-cols-2">
              <FormSelect
                name="type"
                label="Type"
                required
                options={TYPE_OPTIONS}
                disabled={isSubmitting}
              />
              <p className="self-end pb-1 text-xs leading-5 text-gray-500">
                Variant attributes create selectable product options. Descriptive attributes provide product details.
              </p>
            </div>
          </section>

          <section className="rounded-xl border border-gray-200 bg-white">
            <div className="flex flex-col gap-4 border-b border-gray-100 px-6 py-5 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-base font-semibold text-gray-900">Values ({fields.length})</h2>
                <p className="mt-1 text-sm text-gray-500">
                  Add the options admins can select for this attribute.
                </p>
              </div>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => append({ value: '', displayValue: '' }, { shouldFocus: true })}
                disabled={isSubmitting}
                leftIcon={<Plus className="h-4 w-4" />}
              >
                Add value
              </Button>
            </div>

            {fields.length === 0 ? (
              <div className="px-6 py-10 text-center text-sm text-gray-500">
                No values yet. Add options such as White, Black, Navy, or XL.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-[42rem] w-full border-collapse text-left">
                  <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    <tr>
                      <th scope="col" className="w-12 px-6 py-3">#</th>
                      <th scope="col" className="px-3 py-3">Value <span className="text-danger-500">*</span></th>
                      <th scope="col" className="px-3 py-3">Display label</th>
                      <th scope="col" className="w-16 px-3 py-3"><span className="sr-only">Actions</span></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {fields.map((field, index) => {
                    const valueError = errors.values?.[index]?.value?.message;
                    const displayValueError = errors.values?.[index]?.displayValue?.message;

                    return (
                        <tr key={field.id} className="align-top">
                          <td className="px-6 py-4 text-sm tabular-nums text-gray-500">{index + 1}</td>
                          <td className="px-3 py-3">
                          <Input
                            aria-label={`Value ${index + 1}`}
                            placeholder="e.g. WHITE"
                            disabled={isSubmitting}
                            error={Boolean(valueError)}
                            {...register(`values.${index}.value`)}
                          />
                          {valueError && (
                            <p className="mt-1.5 text-xs text-danger-600">{valueError}</p>
                          )}
                          </td>
                          <td className="px-3 py-3">
                          <Input
                            aria-label={`Display label ${index + 1}`}
                            placeholder="e.g. White"
                            disabled={isSubmitting}
                            error={Boolean(displayValueError)}
                            {...register(`values.${index}.displayValue`)}
                          />
                          {displayValueError && (
                            <p className="mt-1.5 text-xs text-danger-600">{displayValueError}</p>
                          )}
                          </td>
                          <td className="px-3 py-3">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => remove(index)}
                            disabled={isSubmitting}
                            aria-label={`Remove value ${index + 1}`}
                            className="text-gray-400 hover:text-danger-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          </td>
                        </tr>
                    );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </form>
    </FormProvider>
  );
}
