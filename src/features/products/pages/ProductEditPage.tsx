import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Layers } from 'lucide-react';
import { AdminLayout } from '@/shared/components/layout/AdminLayout';
import { PageHeader } from '@/shared/components/layout/PageHeader';
import { useBreadcrumbLabel } from '@/shared/components/layout';
import { Button } from '@/shared/components/ui/Button';
import { Badge } from '@/shared/components/ui/Badge';
import { SkeletonForm } from '@/shared/components/feedback/Skeleton';
import { ErrorCard } from '@/shared/components/feedback/ErrorCard';
import { NotFoundState } from '@/shared/components/feedback/NotFoundState';
import { toast } from '@/shared/stores/uiStore';
import { useConfirmDialog } from '@/shared/hooks/useConfirmDialog';
import { AppError } from '@/shared/types/api.types';
import { routes } from '@/constants/routes';
import { useProduct } from '../hooks/useProduct';
import { useCreateProduct } from '../hooks/useCreateProduct';
import { useUpdateProduct } from '../hooks/useUpdateProduct';
import { useCategoryOptions, useBrandOptions } from '../hooks/useCatalogOptions';
import { ProductForm } from '../components/ProductForm';
import { ProductMediaSection } from '../components/ProductMediaSection';
import { ProductDraftPreview } from '../components/ProductDraftPreview';
import type { ProductFormValues } from '../schemas/productSchema';

export function ProductEditPage() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const { confirm } = useConfirmDialog();
  const [isFormDirty, setIsFormDirty] = useState(false);

  const isEditMode = id !== undefined;
  const productId = isEditMode ? id : undefined;

  const { data: product, isLoading, isError, error, refetch } = useProduct(productId);
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct(productId);
  const { data: categories = [] } = useCategoryOptions();
  const { data: brands = [] } = useBrandOptions();

  const isSubmitting = createProduct.isPending || updateProduct.isPending;

  const requestNavigation = async (target: string) => {
    if (isFormDirty) {
      const confirmed = await confirm({
        title: 'Discard unsaved changes?',
        description: 'Your product information changes have not been saved.',
        confirmLabel: 'Discard changes',
        variant: 'destructive',
      });
      if (!confirmed) return;
    }
    navigate(target);
  };

  const handleSubmit = async (values: ProductFormValues) => {
    const payload = {
      name: values.name,
      slug: values.slug,
      brandId: values.brandId ?? null,
      categoryIds: values.categoryIds,
      shortDescription: values.shortDescription,
      description: values.description,
      status: values.status,
      featured: values.featured,
    };

    try {
      if (isEditMode) {
        await updateProduct.mutateAsync(payload);
        toast.success('Product saved.');
      } else {
        const created = await createProduct.mutateAsync(payload);
        toast.success('Product created.');
        navigate(routes.products.edit(created.id), { replace: true });
      }
    } catch (err) {
      if (err instanceof AppError) {
        if (err.code === 'CONFLICT') {
          toast.error('A product with this name or slug already exists.');
        } else if (err.fieldErrors?.length) {
          // Re-throw so ProductForm can map field errors
          throw err;
        } else {
          toast.error(err.message || 'Failed to save product. Please try again.');
        }
      } else {
        toast.error('Failed to save product. Please try again.');
      }
    }
  };

  const isNotFound =
    isEditMode && isError && error instanceof AppError && error.code === 'PRODUCT_NOT_FOUND';
  const breadcrumbLabel = isEditMode
    ? isNotFound
      ? 'Not found'
      : (product?.name ?? 'Loading...')
    : undefined;

  useBreadcrumbLabel(productId ? routes.products.edit(productId) : undefined, breadcrumbLabel);

  if (isEditMode && isLoading) {
    return (
      <AdminLayout>
        <div className="p-6">
          <SkeletonForm fields={8} />
        </div>
      </AdminLayout>
    );
  }

  if (isNotFound) {
    return (
      <AdminLayout>
        <div className="p-6">
          <NotFoundState
            title="Product Not Found"
            message="Product not found or has been deleted."
          />
        </div>
      </AdminLayout>
    );
  }

  if (isEditMode && isError) {
    return (
      <AdminLayout>
        <div className="p-6">
          <ErrorCard onRetry={() => void refetch()} />
        </div>
      </AdminLayout>
    );
  }

  const showNoVariantsWarning =
    isEditMode &&
    (product?.activeVariantCount ??
      product?.variants.filter((variant) => variant.status === 'ACTIVE').length ??
      0) === 0;

  return (
    <AdminLayout>
      <div className="mx-auto w-full max-w-7xl space-y-6 p-6 pb-28">
        <PageHeader
          title={isEditMode ? 'Edit product' : 'New product'}
          description={
            isEditMode
              ? 'Update catalog information, media, and visibility settings.'
              : 'Add a product to your catalog.'
          }
          actions={
            isEditMode && productId ? (
              <>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => void requestNavigation(routes.products.detail(productId))}
                  leftIcon={<ArrowLeft className="h-4 w-4" />}
                >
                  Back to details
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => void requestNavigation(routes.products.variants(productId))}
                  leftIcon={<Layers className="h-4 w-4" />}
                >
                  Manage variants
                </Button>
              </>
            ) : undefined
          }
        />

        <section className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="mb-6 border-b border-gray-100 pb-5">
            <h2 className="text-base font-semibold text-gray-900">Product information</h2>
            <p className="mt-1 text-sm text-gray-500">
              Update the catalog record and its customer-facing visibility.
            </p>
          </div>
          <ProductForm
            product={isEditMode ? product : undefined}
            brands={brands}
            categories={categories}
            isSubmitting={isSubmitting}
            onSubmit={handleSubmit}
            onCancel={() =>
              void requestNavigation(
                isEditMode && productId ? routes.products.detail(productId) : routes.products.list,
              )
            }
            showNoVariantsWarning={showNoVariantsWarning}
            onDirtyChange={setIsFormDirty}
            aside={
              isEditMode && product ? (
                <ProductDraftPreview product={product} brands={brands} categories={categories} />
              ) : undefined
            }
          />
        </section>

        {isEditMode && product && (
          <section className="rounded-xl border border-gray-200 bg-white p-6">
            <div className="mb-6 flex flex-col gap-2 border-b border-gray-100 pb-5 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-base font-semibold text-gray-900">Media library</h2>
                <p className="mt-1 text-sm text-gray-500">
                  Media changes are saved immediately and do not require saving the product form.
                </p>
              </div>
              <Badge variant="info">Saved independently</Badge>
            </div>
            <ProductMediaSection
              productId={product.id}
              media={product.media}
              variants={product.variants}
              disabled={isSubmitting}
            />
          </section>
        )}
      </div>

      {isEditMode && isFormDirty && productId && (
        <div className="fixed inset-x-0 bottom-0 z-20 border-t border-gray-200 bg-white shadow-[0_-8px_16px_-16px_rgba(15,23,42,0.35)] lg:left-64">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-6 py-4">
            <p className="text-sm font-medium text-gray-700">Unsaved changes</p>
            <div className="flex flex-wrap items-center gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={() => void requestNavigation(routes.products.detail(productId))}
                disabled={isSubmitting}
              >
                Discard
              </Button>
              <Button type="submit" form="product-edit-form" isLoading={isSubmitting}>
                Save changes
              </Button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
