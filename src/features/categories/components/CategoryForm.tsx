import { useEffect, useMemo } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormField } from '@/shared/components/form/FormField';
import { FormSelect } from '@/shared/components/form/FormSelect';
import { AppError } from '@/shared/types/api.types';
import { useBeforeUnload } from '@/shared/hooks/useBeforeUnload';
import { slugify } from '@/shared/utils/slugify';
import { categorySchema, type CategoryFormValues } from '../schemas/categorySchema';
import type { Category } from '../types/category.types';
import { ImageUploadField } from '@/shared/media/ImageUploadField';

const STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
];

interface CategoryFormProps {
  category?: Category;
  categories: Category[];
  isSubmitting: boolean;
  onSubmit: (values: CategoryFormValues) => Promise<void>;
  onDirtyChange?: (isDirty: boolean) => void;
  onUploadingChange?: (uploading: boolean) => void;
}

function truncateId(value: string): string {
  return value.slice(0, 8);
}

export function CategoryForm({ category, categories, isSubmitting, onSubmit, onDirtyChange, onUploadingChange }: CategoryFormProps) {
  const isEditMode = category !== undefined;
  const parentOptions = useMemo(() => {
    const options = categories
      .filter((item) => item.id !== category?.id && !item.isDeleted)
      .slice()
      .sort((left, right) => left.name.localeCompare(right.name))
      .map((item) => ({ value: item.id, label: item.name }));

    if (category?.parentId && !options.some((option) => option.value === category.parentId)) {
      options.unshift({ value: category.parentId, label: `Current parent (${truncateId(category.parentId)})` });
    }

    return [{ value: '', label: 'Root category' }, ...options];
  }, [categories, category?.id, category?.parentId]);

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: { parentId: null, name: '', slug: '', description: '', imageUrl: null, sortOrder: null, status: 'ACTIVE' },
  });
  const { formState: { errors, isDirty }, setError, clearErrors } = form;

  useEffect(() => {
    form.reset({
      parentId: category?.parentId ?? null,
      name: category?.name ?? '',
      slug: category?.slug ?? '',
      description: category?.description ?? '',
      imageUrl: category?.imageUrl ?? null,
      imageStorageKey: category?.imageStorageKey ?? null,
      sortOrder: category?.sortOrder ?? null,
      status: category?.status ?? 'ACTIVE',
    });
  }, [category, form]);

  useEffect(() => {
    if (isEditMode) return;
    const subscription = form.watch((values, { name: fieldName }) => {
      if (fieldName === 'name') form.setValue('slug', slugify(values.name ?? ''), { shouldValidate: false });
    });
    return () => subscription.unsubscribe();
  }, [form, isEditMode]);

  useBeforeUnload(isDirty);
  useEffect(() => { onDirtyChange?.(isDirty); }, [isDirty, onDirtyChange]);
  useEffect(() => () => onDirtyChange?.(false), [onDirtyChange]);

  const handleSubmit = form.handleSubmit(async (values) => {
    clearErrors();
    try {
      await onSubmit(values);
      form.reset(values);
    } catch (error) {
      if (error instanceof AppError && error.fieldErrors?.length) {
        error.fieldErrors.forEach(({ field, message }) => {
          if (field in form.getValues()) setError(field as keyof CategoryFormValues, { message });
        });
        return;
      }
      setError('root.server', {
        message: error instanceof AppError ? error.message : 'Failed to save category. Please try again.',
      });
    }
  });

  return (
    <FormProvider {...form}>
      <form id="category-form" onSubmit={(event) => void handleSubmit(event)} noValidate>
        <div className="space-y-6">
          {errors.root?.server?.message && (
            <div className="rounded-md border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-700">{errors.root.server.message}</div>
          )}
          <section className="rounded-xl border border-gray-200 bg-white p-6">
            <div className="mb-6 border-b border-gray-100 pb-5">
              <h2 className="text-base font-semibold text-gray-900">Category information</h2>
              <p className="mt-1 text-sm text-gray-500">Name this category and choose its customer-facing URL.</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField name="name" label="Name" required placeholder="e.g. Men's Clothing" disabled={isSubmitting} />
              <FormField name="slug" label="Slug" required placeholder="e.g. mens-clothing" hint="URL-friendly identifier. Auto-generated from name." disabled={isSubmitting} />
            </div>
          </section>
          <section className="rounded-xl border border-gray-200 bg-white p-6">
            <div className="mb-6 border-b border-gray-100 pb-5">
              <h2 className="text-base font-semibold text-gray-900">Catalog structure</h2>
              <p className="mt-1 text-sm text-gray-500">Set where it appears in the hierarchy and its display order.</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormSelect name="parentId" label="Parent Category" options={parentOptions} disabled={isSubmitting} />
              <FormField name="sortOrder" label="Sort Order" type="number" placeholder="Optional display order" disabled={isSubmitting} />
              {isEditMode && <FormSelect name="status" label="Status" required options={STATUS_OPTIONS} disabled={isSubmitting} />}
            </div>
          </section>
          <section className="rounded-xl border border-gray-200 bg-white p-6">
            <div className="mb-6 border-b border-gray-100 pb-5">
              <h2 className="text-base font-semibold text-gray-900">Customer-facing content</h2>
              <p className="mt-1 text-sm text-gray-500">Add a visual and short description for browsing and discovery.</p>
            </div>
            <div className="space-y-4">
              <ImageUploadField
                purpose="CATEGORY_IMAGE"
                label="Category image"
                url={form.watch('imageUrl')}
                storageKey={form.watch('imageStorageKey')}
                disabled={isSubmitting}
                onChange={(asset) => {
                  form.setValue('imageStorageKey', asset?.storageKey || null, { shouldDirty: true, shouldValidate: true });
                  form.setValue('imageUrl', asset ? (asset.storageKey ? null : asset.mediaUrl) : '', { shouldDirty: true, shouldValidate: true });
                }}
                onUploadingChange={onUploadingChange}
              />
              <FormField name="description" label="Description" multiline rows={3} placeholder="Optional description..." disabled={isSubmitting} />
            </div>
          </section>
        </div>
      </form>
    </FormProvider>
  );
}
