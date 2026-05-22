import { useEffect, useMemo } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Modal } from '@/shared/components/ui/Modal';
import { Button } from '@/shared/components/ui/Button';
import { FormField } from '@/shared/components/form/FormField';
import { FormSelect } from '@/shared/components/form/FormSelect';
import { slugify } from '@/shared/utils/slugify';
import { categorySchema, type CategoryFormValues } from '../schemas/categorySchema';
import type { Category } from '../types/category.types';

const STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
];

interface CategoryFormProps {
  open: boolean;
  onClose: () => void;
  category?: Category;
  categories: Category[];
  isSubmitting: boolean;
  onSubmit: (values: CategoryFormValues) => void;
}

function truncateId(value: string): string {
  return value.slice(0, 8);
}

export function CategoryForm({
  open,
  onClose,
  category,
  categories,
  isSubmitting,
  onSubmit,
}: CategoryFormProps) {
  const isEditMode = category !== undefined;
  const parentOptions = useMemo(() => {
    const options = categories
      .filter((item) => item.id !== category?.id && !item.isDeleted)
      .slice()
      .sort((left, right) => left.name.localeCompare(right.name))
      .map((item) => ({
        value: item.id,
        label: item.name,
      }));

    if (
      category?.parentId &&
      !options.some((option) => option.value === category.parentId)
    ) {
      options.unshift({
        value: category.parentId,
        label: `Current parent (${truncateId(category.parentId)})`,
      });
    }

    return [{ value: '', label: 'Root category' }, ...options];
  }, [categories, category?.id, category?.parentId]);

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      parentId: null,
      name: '',
      slug: '',
      description: '',
      imageUrl: null,
      sortOrder: null,
      status: 'ACTIVE',
    },
  });

  useEffect(() => {
    if (open) {
      if (category) {
        form.reset({
          parentId: category.parentId,
          name: category.name,
          slug: category.slug,
          description: category.description ?? '',
          imageUrl: category.imageUrl ?? null,
          sortOrder: category.sortOrder,
          status: category.status,
        });
      } else {
        form.reset({
          parentId: null,
          name: '',
          slug: '',
          description: '',
          imageUrl: null,
          sortOrder: null,
          status: 'ACTIVE',
        });
      }
    }
  }, [open, category, form]);

  // Auto-generate slug from name in create mode only
  useEffect(() => {
    if (isEditMode) return;
    const subscription = form.watch((values, { name: fieldName }) => {
      if (fieldName === 'name') {
        form.setValue('slug', slugify(values.name ?? ''), { shouldValidate: false });
      }
    });
    return () => subscription.unsubscribe();
  }, [form, isEditMode]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEditMode ? 'Edit Category' : 'New Category'}
      size="md"
      closeOnBackdropClick={false}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" form="category-form" isLoading={isSubmitting}>
            {isSubmitting ? 'Saving…' : isEditMode ? 'Save changes' : 'Create category'}
          </Button>
        </>
      }
    >
      <FormProvider {...form}>
        <form
          id="category-form"
          onSubmit={(event) => {
            void form.handleSubmit(onSubmit)(event);
          }}
          noValidate
        >
          <div className="space-y-4">
            <FormSelect
              name="parentId"
              label="Parent Category"
              options={parentOptions}
              disabled={isSubmitting}
            />
            <FormField
              name="name"
              label="Name"
              required
              placeholder="e.g. Men's Clothing"
              disabled={isSubmitting}
            />
            <FormField
              name="slug"
              label="Slug"
              required
              placeholder="e.g. mens-clothing"
              hint="URL-friendly identifier. Auto-generated from name."
              disabled={isSubmitting}
            />
            <FormField
              name="imageUrl"
              label="Image URL"
              placeholder="https://example.com/category.jpg"
              hint="Optional thumbnail shown in the category table."
              disabled={isSubmitting}
            />
            <FormField
              name="description"
              label="Description"
              multiline
              rows={3}
              placeholder="Optional description…"
              disabled={isSubmitting}
            />
            <FormField
              name="sortOrder"
              label="Sort Order"
              type="number"
              placeholder="Optional display order"
              disabled={isSubmitting}
            />
            {isEditMode && (
              <FormSelect
                name="status"
                label="Status"
                required
                options={STATUS_OPTIONS}
                disabled={isSubmitting}
              />
            )}
          </div>
        </form>
      </FormProvider>
    </Modal>
  );
}
