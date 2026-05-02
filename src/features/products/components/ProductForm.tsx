import { useEffect, useMemo } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertTriangle } from 'lucide-react';
import { FormField } from '@/shared/components/form/FormField';
import { FormSelect } from '@/shared/components/form/FormSelect';
import { FormToggle } from '@/shared/components/form/FormToggle';
import { FormMultiSelect } from '@/shared/components/form/FormMultiSelect';
import { Button } from '@/shared/components/ui/Button';
import { useBeforeUnload } from '@/shared/hooks/useBeforeUnload';
import { slugify } from '@/shared/utils/slugify';
import { productSchema, type ProductFormValues } from '../schemas/productSchema';
import type { Product, BrandOption, CategoryOption } from '../types/product.types';

const STATUS_OPTIONS = [
  { value: 'DRAFT', label: 'Draft' },
  { value: 'PUBLISHED', label: 'Published' },
  { value: 'INACTIVE', label: 'Inactive' },
];

interface ProductFormProps {
  product?: Product;
  brands: BrandOption[];
  categories: CategoryOption[];
  isSubmitting: boolean;
  onSubmit: (values: ProductFormValues) => void;
  onCancel: () => void;
  showNoVariantsWarning?: boolean;
}

export function ProductForm({
  product,
  brands,
  categories,
  isSubmitting,
  onSubmit,
  onCancel,
  showNoVariantsWarning,
}: ProductFormProps) {
  const isEditMode = product !== undefined;

  const defaultValues: ProductFormValues = {
    name: product?.name ?? '',
    slug: product?.slug ?? '',
    brandId: product?.brand?.id ?? null,
    categoryIds: product?.categories.map((c) => c.id) ?? [],
    shortDescription: product?.shortDescription ?? '',
    description: product?.description ?? '',
    status: product?.status ?? 'DRAFT',
    featured: product?.featured ?? false,
  };

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues,
  });

  const isDirty = form.formState.isDirty;
  useBeforeUnload(isDirty);

  // Auto-generate slug from name in create mode only
  const nameValue = form.watch('name');
  useEffect(() => {
    if (!isEditMode && nameValue) {
      form.setValue('slug', slugify(nameValue), { shouldValidate: false });
    }
  }, [nameValue, isEditMode, form]);

  const brandOptions = useMemo(
    () => [
      { value: '', label: 'No brand' },
      ...brands.map((b) => ({ value: String(b.id), label: b.name })),
    ],
    [brands],
  );

  const categoryOptions = useMemo(
    () => categories.map((c) => ({ value: c.id, label: c.name })),
    [categories],
  );

  const handleSaveAndPublish = () => {
    form.setValue('status', 'PUBLISHED');
    void form.handleSubmit(onSubmit)();
  };

  const watchedStatus = form.watch('status');
  const showPublishWarning =
    showNoVariantsWarning && (watchedStatus === 'PUBLISHED' || watchedStatus === 'INACTIVE');

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
        <div className="space-y-8">
          {showPublishWarning && watchedStatus === 'PUBLISHED' && (
            <div className="flex items-start gap-3 rounded-lg border border-warning-300 bg-warning-50 px-4 py-3">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning-600" aria-hidden />
              <p className="text-sm text-warning-800">
                This product has no active variants. Customers will not be able to purchase it.
              </p>
            </div>
          )}

          {/* Basic Info */}
          <section className="space-y-4">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Basic Information
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                name="name"
                label="Product name"
                required
                placeholder="e.g. Classic White T-Shirt"
                disabled={isSubmitting}
              />
              <FormField
                name="slug"
                label="Slug"
                required
                placeholder="classic-white-t-shirt"
                hint="URL-friendly identifier. Auto-generated from name."
                disabled={isSubmitting}
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormSelect
                name="brandId"
                label="Brand"
                placeholder="Select brand"
                options={brandOptions}
                disabled={isSubmitting}
              />
              <FormMultiSelect
                name="categoryIds"
                label="Categories"
                placeholder="Select categories"
                options={categoryOptions}
                disabled={isSubmitting}
              />
            </div>
            <FormField
              name="shortDescription"
              label="Short description"
              multiline
              rows={2}
              placeholder="Brief summary for product listings (max 300 characters)"
              hint="Shown in product cards and search results."
              disabled={isSubmitting}
            />
            <FormField
              name="description"
              label="Full description"
              multiline
              rows={6}
              placeholder="Detailed product description…"
              disabled={isSubmitting}
            />
          </section>

          {/* Status & Settings */}
          <section className="space-y-4">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Status & Settings
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormSelect
                name="status"
                label="Status"
                required
                options={STATUS_OPTIONS}
                disabled={isSubmitting}
              />
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Featured</label>
                <div className="flex h-9 items-center">
                  <FormToggle
                    name="featured"
                    label="Show in featured section"
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Actions */}
          <div className="flex items-center gap-3 border-t pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              {isSubmitting ? 'Saving…' : isEditMode ? 'Save changes' : 'Create product'}
            </Button>
            {!isEditMode && (
              <Button
                type="button"
                variant="secondary"
                onClick={handleSaveAndPublish}
                disabled={isSubmitting}
              >
                Save & Publish
              </Button>
            )}
          </div>
        </div>
      </form>
    </FormProvider>
  );
}
