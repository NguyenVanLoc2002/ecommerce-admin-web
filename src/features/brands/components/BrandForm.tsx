import { useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Modal } from '@/shared/components/ui/Modal';
import { Button } from '@/shared/components/ui/Button';
import { FormField } from '@/shared/components/form/FormField';
import { FormSelect } from '@/shared/components/form/FormSelect';
import { slugify } from '@/shared/utils/slugify';
import { brandSchema, type BrandFormValues } from '../schemas/brandSchema';
import type { Brand } from '../types/brand.types';

const STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
];

interface BrandFormProps {
  open: boolean;
  onClose: () => void;
  brand?: Brand;
  isSubmitting: boolean;
  onSubmit: (values: BrandFormValues) => void;
}

export function BrandForm({ open, onClose, brand, isSubmitting, onSubmit }: BrandFormProps) {
  const isEditMode = brand !== undefined;

  const form = useForm<BrandFormValues>({
    resolver: zodResolver(brandSchema),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      logoUrl: null,
      status: 'ACTIVE',
    },
  });

  useEffect(() => {
    if (open) {
      if (brand) {
        form.reset({
          name: brand.name,
          slug: brand.slug,
          description: brand.description ?? '',
          logoUrl: brand.logoUrl ?? null,
          status: brand.status,
        });
      } else {
        form.reset({ name: '', slug: '', description: '', logoUrl: null, status: 'ACTIVE' });
      }
    }
  }, [open, brand, form]);

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
      title={isEditMode ? 'Edit Brand' : 'New Brand'}
      size="md"
      closeOnBackdropClick={false}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" form="brand-form" isLoading={isSubmitting}>
            {isSubmitting ? 'Saving…' : isEditMode ? 'Save changes' : 'Create brand'}
          </Button>
        </>
      }
    >
      <FormProvider {...form}>
        <form id="brand-form" onSubmit={form.handleSubmit(onSubmit)} noValidate>
          <div className="space-y-4">
            <FormField
              name="name"
              label="Name"
              required
              placeholder="e.g. Nike"
              disabled={isSubmitting}
            />
            <FormField
              name="slug"
              label="Slug"
              required
              placeholder="e.g. nike"
              hint="URL-friendly identifier. Auto-generated from name."
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
              name="logoUrl"
              label="Logo URL"
              placeholder="https://example.com/logo.png"
              hint="Direct link to the brand logo image."
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
