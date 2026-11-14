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
import { AppError, SoftDeleteState } from '@/shared/types/api.types';
import { CategoryForm } from '../components/CategoryForm';
import { useCategories } from '../hooks/useCategories';
import { useCategory } from '../hooks/useCategory';
import { useCreateCategory } from '../hooks/useCreateCategory';
import { useUpdateCategory } from '../hooks/useUpdateCategory';
import type { CategoryListParams } from '../types/category.types';
import type { CategoryFormValues } from '../schemas/categorySchema';

const PARENT_CATEGORY_PARAMS: CategoryListParams = {
  page: 0,
  size: 200,
  sort: 'name,asc',
  deletedState: SoftDeleteState.ACTIVE,
};

export function CategoryEditPage() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const { confirm } = useConfirmDialog();
  const [isDirty, setIsDirty] = useState(false);
  const isEditMode = id !== undefined;
  const { data: category, isLoading, isError, error, refetch } = useCategory(id);
  const { data: parentCategoryData } = useCategories(PARENT_CATEGORY_PARAMS);
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const isSubmitting = createCategory.isPending || updateCategory.isPending;
  const isNotFound = isEditMode && isError && error instanceof AppError && error.code === 'CATEGORY_NOT_FOUND';

  useBreadcrumbLabel(
    id ? routes.categories.edit(id) : undefined,
    isEditMode ? (isNotFound ? 'Not found' : (category?.name ?? 'Loading...')) : undefined,
  );

  const requestNavigation = async (target: string) => {
    if (isDirty) {
      const confirmed = await confirm({
        title: 'Discard unsaved changes?',
        description: 'Your category changes have not been saved.',
        confirmLabel: 'Discard changes',
        variant: 'destructive',
      });
      if (!confirmed) return;
    }
    navigate(target);
  };

  const handleSubmit = async (values: CategoryFormValues) => {
    const payload = {
      parentId: values.parentId,
      name: values.name,
      slug: values.slug,
      description: values.description,
      imageUrl: values.imageUrl,
      sortOrder: values.sortOrder,
    };

    if (category) {
      await updateCategory.mutateAsync({
        id: category.id,
        body: { ...payload, ...(values.status ? { status: values.status } : {}) },
      });
      toast.success('Category saved.');
      return;
    }

    const created = await createCategory.mutateAsync(payload);
    toast.success('Category created.');
    navigate(routes.categories.edit(created.id), { replace: true });
  };

  return (
    <AdminLayout>
      <div className="mx-auto w-full max-w-5xl space-y-6 p-6 pb-28">
        <PageHeader
          title={isEditMode ? 'Edit category' : 'New category'}
          description={isEditMode ? 'Update its hierarchy, presentation, and visibility.' : 'Create a place for customers to browse related products.'}
          actions={
            <Button variant="secondary" size="sm" onClick={() => void requestNavigation(routes.categories.list)} leftIcon={<ArrowLeft className="h-4 w-4" />}>
              Back to categories
            </Button>
          }
        />

        {isEditMode && isLoading && <SkeletonForm fields={7} />}
        {isNotFound && <NotFoundState title="Category Not Found" message="This category does not exist or has been deleted." />}
        {isEditMode && isError && !isNotFound && <ErrorCard onRetry={() => void refetch()} />}
        {(!isEditMode || (!isLoading && !isError && category)) && (
          <CategoryForm
            category={category}
            categories={parentCategoryData?.items ?? []}
            isSubmitting={isSubmitting}
            onSubmit={handleSubmit}
            onDirtyChange={setIsDirty}
          />
        )}
      </div>

      {(!isEditMode || Boolean(category)) && (
        <div className="fixed inset-x-0 bottom-0 z-20 border-t border-gray-200 bg-white shadow-[0_-8px_16px_-16px_rgba(15,23,42,0.35)] lg:left-64">
          <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-6 py-4">
            <p className="text-sm font-medium text-gray-700">{isDirty ? 'Unsaved changes' : isEditMode ? 'All changes saved' : 'Ready to create'}</p>
            <div className="flex flex-wrap items-center gap-3">
              <Button type="button" variant="secondary" onClick={() => void requestNavigation(routes.categories.list)} disabled={isSubmitting}>Cancel</Button>
              <Button type="submit" form="category-form" isLoading={isSubmitting}>{isSubmitting ? 'Saving...' : isEditMode ? 'Save changes' : 'Create category'}</Button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
