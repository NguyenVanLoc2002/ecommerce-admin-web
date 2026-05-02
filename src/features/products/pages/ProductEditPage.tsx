import { useNavigate, useParams } from 'react-router-dom';
import { Layers } from 'lucide-react';
import { AdminLayout } from '@/shared/components/layout/AdminLayout';
import { PageHeader } from '@/shared/components/layout/PageHeader';
import { useBreadcrumbLabel } from '@/shared/components/layout';
import { Button } from '@/shared/components/ui/Button';
import { CopyValueButton } from '@/shared/components/ui/CopyValueButton';
import { SkeletonForm } from '@/shared/components/feedback/Skeleton';
import { ErrorCard } from '@/shared/components/feedback/ErrorCard';
import { NotFoundState } from '@/shared/components/feedback/NotFoundState';
import { toast } from '@/shared/stores/uiStore';
import { AppError } from '@/shared/types/api.types';
import { routes } from '@/constants/routes';
import { useProduct } from '../hooks/useProduct';
import { useCreateProduct } from '../hooks/useCreateProduct';
import { useUpdateProduct } from '../hooks/useUpdateProduct';
import { useCategoryOptions, useBrandOptions } from '../hooks/useCatalogOptions';
import { ProductForm } from '../components/ProductForm';
import { ProductSummaryCard } from '../components/ProductSummaryCard';
import type { ProductFormValues } from '../schemas/productSchema';

export function ProductEditPage() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();

  const isEditMode = id !== undefined;
  const productId = isEditMode ? id : undefined;

  const { data: product, isLoading, isError, error, refetch } = useProduct(productId);
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct(productId);
  const { data: categories = [] } = useCategoryOptions();
  const { data: brands = [] } = useBrandOptions();

  const isSubmitting = createProduct.isPending || updateProduct.isPending;

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
    ? (isNotFound ? 'Not found' : (product?.name ?? 'Loading...'))
    : undefined;

  useBreadcrumbLabel(
    productId ? routes.products.edit(productId) : undefined,
    breadcrumbLabel,
  );

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
    ((product?.activeVariantCount
      ?? product?.variants.filter((variant) => variant.status === 'ACTIVE').length
      ?? 0) === 0);

  return (
    <AdminLayout>
      <div className="mx-auto w-full max-w-6xl space-y-6 p-6">
        <PageHeader
          title={isEditMode ? (product?.name ?? 'Edit Product') : 'New Product'}
          description={
            isEditMode
              ? (product?.brand?.name
                ? `${product.brand.name} product configuration`
                : 'Update product details, categories, and visibility settings.')
              : 'Add a product to your catalog.'
          }
          actions={
            isEditMode && productId ? (
              <>
                <CopyValueButton value={productId} label="Copy ID" />
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => navigate(routes.products.variants(productId))}
                  leftIcon={<Layers className="h-4 w-4" />}
                >
                  Manage Variants
                </Button>
              </>
            ) : undefined
          }
        />

        {isEditMode && product ? (
          <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <ProductForm
                product={product}
                brands={brands}
                categories={categories}
                isSubmitting={isSubmitting}
                onSubmit={(values) => void handleSubmit(values)}
                onCancel={() => navigate(routes.products.list)}
                showNoVariantsWarning={showNoVariantsWarning}
              />
            </div>
            <ProductSummaryCard product={product} />
          </div>
        ) : (
          <div className="mx-auto w-full max-w-3xl rounded-lg border border-gray-200 bg-white p-6">
            <ProductForm
              product={undefined}
              brands={brands}
              categories={categories}
              isSubmitting={isSubmitting}
              onSubmit={(values) => void handleSubmit(values)}
              onCancel={() => navigate(routes.products.list)}
              showNoVariantsWarning={showNoVariantsWarning}
            />
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
