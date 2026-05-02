import { useEffect, useMemo } from 'react';
import { useForm, FormProvider, type Path } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { Modal } from '@/shared/components/ui/Modal';
import { Button } from '@/shared/components/ui/Button';
import { FormField } from '@/shared/components/form/FormField';
import { FormSelect } from '@/shared/components/form/FormSelect';
import { FormToggle } from '@/shared/components/form/FormToggle';
import { EmptyState } from '@/shared/components/feedback/EmptyState';
import { ErrorCard } from '@/shared/components/feedback/ErrorCard';
import { AppError } from '@/shared/types/api.types';
import { VariantStatus } from '@/shared/types/enums';
import { routes } from '@/constants/routes';
import { variantSchema, type VariantFormValues } from '../schemas/variantSchema';
import type { ProductVariant, VariantAttributeDefinition } from '../types/product.types';
import {
  buildVariantNamePreview,
  getSelectableVariantAttributes,
  matchesGeneratedVariantName,
} from '../utils/variantForm';

const STATUS_OPTIONS = Object.values(VariantStatus).map((status) => ({
  value: status,
  label: status.charAt(0) + status.slice(1).toLowerCase(),
}));

const WEIGHT_PRESETS = [180, 250, 350, 500, 700];

interface VariantFormProps {
  open: boolean;
  onClose: () => void;
  variant?: ProductVariant;
  attributes: VariantAttributeDefinition[];
  isAttributesLoading: boolean;
  isAttributesError: boolean;
  onRetryAttributes: () => void;
  isSubmitting: boolean;
  onSubmit: (values: VariantFormValues) => Promise<void>;
}

function normalizeFieldPath(field: string): string {
  return field.replace(/\[(\d+)\]/g, '.$1');
}

function SectionHeading({ title, description }: { title: string; description?: string }) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
      {description && <p className="mt-1 text-xs text-gray-500">{description}</p>}
    </div>
  );
}

export function VariantForm({
  open,
  onClose,
  variant,
  attributes,
  isAttributesLoading,
  isAttributesError,
  onRetryAttributes,
  isSubmitting,
  onSubmit,
}: VariantFormProps) {
  const navigate = useNavigate();
  const isEditMode = variant !== undefined;

  const form = useForm<VariantFormValues>({
    resolver: zodResolver(variantSchema),
    defaultValues: {
      sku: '',
      autoGenerateSku: true,
      barcode: '',
      autoGenerateBarcode: false,
      variantName: '',
      autoGenerateVariantName: true,
      basePrice: undefined,
      salePrice: null,
      compareAtPrice: null,
      weightGram: null,
      status: VariantStatus.ACTIVE,
      attributeValueIds: [],
    },
  });

  const {
    clearErrors,
    formState: { errors },
    setError,
    setValue,
    watch,
  } = form;

  const selectedAttributeValueIds = watch('attributeValueIds');
  const autoGenerateVariantName = watch('autoGenerateVariantName');
  const autoGenerateSku = watch('autoGenerateSku');
  const autoGenerateBarcode = watch('autoGenerateBarcode');
  const selectedWeight = watch('weightGram');

  const activeAttributes = useMemo(
    () => getSelectableVariantAttributes(attributes),
    [attributes],
  );

  const generatedVariantName = useMemo(
    () => buildVariantNamePreview(activeAttributes, selectedAttributeValueIds),
    [activeAttributes, selectedAttributeValueIds],
  );

  useEffect(() => {
    if (!open) {
      return;
    }

    clearErrors();

    if (variant) {
      form.reset({
        sku: variant.sku ?? '',
        autoGenerateSku: !variant.sku,
        barcode: variant.barcode ?? '',
        autoGenerateBarcode: false,
        variantName: variant.variantName ?? '',
        autoGenerateVariantName: matchesGeneratedVariantName(variant, activeAttributes),
        basePrice: variant.basePrice,
        salePrice: variant.salePrice,
        compareAtPrice: variant.compareAtPrice,
        weightGram: variant.weightGram,
        status: variant.status,
        attributeValueIds: variant.attributes.map((attribute) => attribute.valueId),
      });
      return;
    }

    form.reset({
      sku: '',
      autoGenerateSku: true,
      barcode: '',
      autoGenerateBarcode: false,
      variantName: '',
      autoGenerateVariantName: true,
      basePrice: undefined,
      salePrice: null,
      compareAtPrice: null,
      weightGram: null,
      status: VariantStatus.ACTIVE,
      attributeValueIds: [],
    });
  }, [activeAttributes, clearErrors, form, open, variant]);

  useEffect(() => {
    if (!autoGenerateVariantName) {
      return;
    }

    setValue('variantName', generatedVariantName, {
      shouldDirty: false,
      shouldValidate: false,
    });
  }, [autoGenerateVariantName, generatedVariantName, setValue]);

  const rootError = errors.root?.server?.message;
  const attributeError = errors.attributeValueIds?.message;

  const handleAttributeSelection = (attribute: VariantAttributeDefinition, valueId: string) => {
    const attributeValueIdSet = new Set(attribute.values.map((value) => value.id));
    const currentValueId = selectedAttributeValueIds.find((id) => attributeValueIdSet.has(id));
    const nextValueIds = selectedAttributeValueIds.filter((id) => !attributeValueIdSet.has(id));

    if (currentValueId !== valueId) {
      nextValueIds.push(valueId);
    }

    setValue('attributeValueIds', nextValueIds, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const handleSubmit = form.handleSubmit(async (values) => {
    clearErrors();

    if (values.autoGenerateVariantName && !generatedVariantName.trim()) {
      setError('variantName', {
        message: 'Select attribute values or turn off auto-generate variant name.',
      });
      return;
    }

    try {
      await onSubmit(values);
    } catch (error) {
      if (error instanceof AppError) {
        if (error.code === 'SKU_ALREADY_EXISTS') {
          setError('sku', { message: 'This SKU already exists.' });
          return;
        }

        if (error.code === 'BARCODE_ALREADY_EXISTS') {
          setError('barcode', { message: 'This barcode already exists.' });
          return;
        }

        if (error.code === 'VARIANT_COMBINATION_DUPLICATE') {
          setError('attributeValueIds', {
            message: 'This attribute combination already exists for the product.',
          });
          return;
        }

        if (error.fieldErrors?.length) {
          error.fieldErrors.forEach(({ field, message }) => {
            setError(normalizeFieldPath(field) as Path<VariantFormValues>, { message });
          });
          return;
        }

        setError('root.server', { message: error.message });
        return;
      }

      setError('root.server', { message: 'Failed to save variant. Please try again.' });
    }
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEditMode ? 'Edit Variant' : 'Add Variant'}
      description="Configure variant identity, reusable attribute values, and commercial details."
      size="full"
      closeOnBackdropClick={false}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" form="variant-form" isLoading={isSubmitting}>
            {isSubmitting ? 'Saving…' : isEditMode ? 'Save changes' : 'Add variant'}
          </Button>
        </>
      }
    >
      <FormProvider {...form}>
        <form id="variant-form" onSubmit={handleSubmit} noValidate>
          <div className="max-h-[72vh] space-y-6 overflow-y-auto pr-1">
            {rootError && (
              <div className="rounded-md border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-700">
                {rootError}
              </div>
            )}

            <section className="space-y-4">
              <SectionHeading
                title="Basic information"
                description="Choose how the system should generate the variant identity fields."
              />

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3 rounded-lg border border-gray-200 p-4">
                  <FormToggle
                    name="autoGenerateSku"
                    label="Auto-generate SKU"
                    hint="SKU will be generated by the system."
                    disabled={isSubmitting}
                  />
                  <FormField
                    name="sku"
                    label="SKU"
                    required={!autoGenerateSku}
                    placeholder="e.g. SHIRT-WHT-M"
                    disabled={isSubmitting || autoGenerateSku}
                  />
                </div>

                <div className="space-y-3 rounded-lg border border-gray-200 p-4">
                  <FormToggle
                    name="autoGenerateBarcode"
                    label="Auto-generate barcode"
                    hint="Leave this enabled if the backend should create a barcode."
                    disabled={isSubmitting}
                  />
                  <FormField
                    name="barcode"
                    label="Barcode"
                    placeholder="Optional barcode"
                    disabled={isSubmitting || autoGenerateBarcode}
                  />
                </div>
              </div>

              <div className="rounded-lg border border-gray-200 p-4">
                <FormToggle
                  name="autoGenerateVariantName"
                  label="Auto-generate variant name"
                  hint={
                    generatedVariantName
                      ? `Preview: ${generatedVariantName}`
                      : 'Select attribute values to build the preview automatically.'
                  }
                  disabled={isSubmitting}
                />
                <div className="mt-3">
                  <FormField
                    name="variantName"
                    label="Variant name"
                    required={!autoGenerateVariantName}
                    placeholder="e.g. White / M"
                    disabled={isSubmitting || autoGenerateVariantName}
                  />
                </div>
              </div>
            </section>

            <section className="space-y-4 border-t border-gray-200 pt-6">
              <SectionHeading
                title="Attributes"
                description="Choose at most one value from each reusable variant attribute."
              />

              {isAttributesLoading ? (
                <div className="rounded-lg border border-gray-200 px-4 py-6 text-sm text-gray-500">
                  Loading variant attributes…
                </div>
              ) : isAttributesError ? (
                <ErrorCard
                  className="rounded-lg border border-gray-200 py-8"
                  message="Failed to load variant attributes."
                  onRetry={onRetryAttributes}
                />
              ) : attributes.length === 0 ? (
                <div className="rounded-lg border border-dashed border-gray-300">
                  <EmptyState
                    title="No active variant attributes found. Create or restore attributes first."
                    action={{
                      label: 'Manage attributes',
                      onClick: () => {
                        onClose();
                        navigate(routes.productAttributes.list);
                      },
                    }}
                    className="py-10"
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  {activeAttributes.map((attribute) => {
                    const selectedValueId = selectedAttributeValueIds.find((id) =>
                      attribute.values.some((value) => value.id === id),
                    );

                    return (
                      <div key={attribute.id} className="rounded-lg border border-gray-200 p-4">
                        <div className="mb-3">
                          <p className="text-sm font-medium text-gray-900">{attribute.name}</p>
                          <p className="text-xs font-mono text-gray-400">{attribute.code}</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {attribute.values.map((value) => {
                            const isSelected = selectedValueId === value.id;

                            return (
                              <button
                                key={value.id}
                                type="button"
                                onClick={() => handleAttributeSelection(attribute, value.id)}
                                disabled={isSubmitting}
                                className={[
                                  'rounded-md border px-3 py-2 text-sm font-medium transition-colors',
                                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-1',
                                  isSelected
                                    ? 'border-primary-300 bg-primary-50 text-primary-700'
                                    : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50',
                                  isSubmitting ? 'cursor-not-allowed opacity-60' : '',
                                ].join(' ')}
                              >
                                {value.displayValue ?? value.value}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {attributeError && <p className="text-xs text-danger-600">{attributeError}</p>}
            </section>

            <section className="space-y-4 border-t border-gray-200 pt-6">
              <SectionHeading title="Pricing" />
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  name="basePrice"
                  label="Base price"
                  required
                  type="number"
                  placeholder="0"
                  disabled={isSubmitting}
                />
                <FormField
                  name="salePrice"
                  label="Sale price"
                  type="number"
                  placeholder="Optional"
                  disabled={isSubmitting}
                />
                <FormField
                  name="compareAtPrice"
                  label="Compare at price"
                  type="number"
                  placeholder="Optional"
                  disabled={isSubmitting}
                />
              </div>
            </section>

            <section className="space-y-4 border-t border-gray-200 pt-6">
              <SectionHeading
                title="Shipping"
                description="Use a common preset or switch to a custom weight."
              />
              <div className="space-y-3 rounded-lg border border-gray-200 p-4">
                <div className="flex flex-wrap gap-2">
                  {WEIGHT_PRESETS.map((preset) => {
                    const isSelected = selectedWeight === preset;

                    return (
                      <button
                        key={preset}
                        type="button"
                        onClick={() =>
                          setValue('weightGram', preset, { shouldDirty: true, shouldValidate: true })
                        }
                        disabled={isSubmitting}
                        className={[
                          'rounded-md border px-3 py-2 text-sm font-medium transition-colors',
                          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-1',
                          isSelected
                            ? 'border-primary-300 bg-primary-50 text-primary-700'
                            : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50',
                          isSubmitting ? 'cursor-not-allowed opacity-60' : '',
                        ].join(' ')}
                      >
                        {preset}g
                      </button>
                    );
                  })}
                  <button
                    type="button"
                    onClick={() =>
                      setValue('weightGram', null, { shouldDirty: true, shouldValidate: false })
                    }
                    disabled={isSubmitting}
                    className={[
                      'rounded-md border px-3 py-2 text-sm font-medium transition-colors',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-1',
                      selectedWeight != null && !WEIGHT_PRESETS.includes(selectedWeight)
                        ? 'border-primary-300 bg-primary-50 text-primary-700'
                        : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50',
                      isSubmitting ? 'cursor-not-allowed opacity-60' : '',
                    ].join(' ')}
                  >
                    Custom
                  </button>
                </div>
                <FormField
                  name="weightGram"
                  label="Weight (gram)"
                  type="number"
                  placeholder="Optional"
                  disabled={isSubmitting}
                />
              </div>
            </section>

            <section className="space-y-4 border-t border-gray-200 pt-6">
              <SectionHeading title="Status" />
              <FormSelect
                name="status"
                label="Status"
                required
                options={STATUS_OPTIONS}
                disabled={isSubmitting}
              />
            </section>
          </div>
        </form>
      </FormProvider>
    </Modal>
  );
}
