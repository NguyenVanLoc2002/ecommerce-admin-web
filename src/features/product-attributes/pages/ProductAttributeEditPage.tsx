import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { routes } from '@/constants/routes';
import { AdminLayout } from '@/shared/components/layout/AdminLayout';
import { PageHeader } from '@/shared/components/layout/PageHeader';
import { useBreadcrumbLabel } from '@/shared/components/layout';
import { Button } from '@/shared/components/ui/Button';
import { ErrorCard } from '@/shared/components/feedback/ErrorCard';
import { NotFoundState } from '@/shared/components/feedback/NotFoundState';
import { SkeletonForm } from '@/shared/components/feedback/Skeleton';
import { useConfirmDialog } from '@/shared/hooks/useConfirmDialog';
import { toast } from '@/shared/stores/uiStore';
import { AppError } from '@/shared/types/api.types';
import { ProductAttributeForm } from '../components/ProductAttributeForm';
import { useCreateProductAttribute } from '../hooks/useCreateProductAttribute';
import { useProductAttribute } from '../hooks/useProductAttribute';
import { useUpdateProductAttribute } from '../hooks/useUpdateProductAttribute';
import type { ProductAttributeFormValues } from '../schemas/productAttributeSchema';

export function ProductAttributeEditPage() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const { confirm } = useConfirmDialog();
  const [isDirty, setIsDirty] = useState(false);
  const isEditMode = id !== undefined;
  const { data: attribute, isLoading, isError, error, refetch } = useProductAttribute(id);
  const createAttribute = useCreateProductAttribute();
  const updateAttribute = useUpdateProductAttribute();
  const isSubmitting = createAttribute.isPending || updateAttribute.isPending;
  const isNotFound =
    isEditMode && isError && error instanceof AppError && error.code === 'PRODUCT_ATTRIBUTE_NOT_FOUND';

  useBreadcrumbLabel(
    id ? routes.productAttributes.edit(id) : undefined,
    isEditMode ? (isNotFound ? 'Not found' : (attribute?.name ?? 'Loading...')) : undefined,
  );

  const requestNavigation = async (target: string) => {
    if (isDirty) {
      const confirmed = await confirm({
        title: 'Discard unsaved changes?',
        description: 'Your product attribute changes have not been saved.',
        confirmLabel: 'Discard changes',
        variant: 'destructive',
      });
      if (!confirmed) return;
    }
    navigate(target);
  };

  const handleSubmit = async (values: ProductAttributeFormValues) => {
    const payload = {
      name: values.name.trim(),
      code: values.code.trim(),
      type: values.type,
      values: values.values.map((entry) => ({
        ...(entry.id ? { id: entry.id } : {}),
        value: entry.value.trim(),
        displayValue: entry.displayValue?.trim() || null,
      })),
    };

    if (attribute) {
      await updateAttribute.mutateAsync({ id: attribute.id, body: payload });
      toast.success('Product attribute updated.');
      return;
    }

    const created = await createAttribute.mutateAsync(payload);
    toast.success('Product attribute created.');
    navigate(routes.productAttributes.edit(created.id), { replace: true });
  };

  return (
    <AdminLayout>
      <div className="mx-auto w-full max-w-7xl space-y-6 p-6 pb-28">
        <PageHeader
          title={isEditMode ? 'Edit attribute' : 'New attribute'}
          description={
            isEditMode
              ? 'Update the attribute definition and its selectable values.'
              : 'Create a reusable attribute for your product catalog.'
          }
          actions={
            <Button
              variant="secondary"
              size="sm"
              onClick={() => void requestNavigation(routes.productAttributes.list)}
              leftIcon={<ArrowLeft className="h-4 w-4" />}
            >
              Back to attributes
            </Button>
          }
        />

        {isEditMode && isLoading && <SkeletonForm fields={7} />}
        {isNotFound && (
          <NotFoundState
            title="Product Attribute Not Found"
            message="This product attribute does not exist or has been deleted."
          />
        )}
        {isEditMode && isError && !isNotFound && <ErrorCard onRetry={() => void refetch()} />}

        {(!isEditMode || (!isLoading && !isError && attribute)) && (
          <ProductAttributeForm
            attribute={attribute}
            isSubmitting={isSubmitting}
            onSubmit={handleSubmit}
            onDirtyChange={setIsDirty}
          />
        )}
      </div>

      {(!isEditMode || Boolean(attribute)) && (
        <div className="fixed inset-x-0 bottom-0 z-20 border-t border-gray-200 bg-white shadow-[0_-8px_16px_-16px_rgba(15,23,42,0.35)] lg:left-64">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-6 py-4">
            <p className="text-sm font-medium text-gray-700">
              {isDirty ? 'Unsaved changes' : isEditMode ? 'All changes saved' : 'Ready to create'}
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={() => void requestNavigation(routes.productAttributes.list)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" form="product-attribute-form" isLoading={isSubmitting}>
                {isSubmitting ? 'Saving...' : isEditMode ? 'Save changes' : 'Create attribute'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
