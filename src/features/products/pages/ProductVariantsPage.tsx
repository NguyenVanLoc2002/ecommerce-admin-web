import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { AdminLayout } from '@/shared/components/layout/AdminLayout';
import { PageHeader } from '@/shared/components/layout/PageHeader';
import { Button } from '@/shared/components/ui/Button';
import { SkeletonForm } from '@/shared/components/feedback/Skeleton';
import { ErrorCard } from '@/shared/components/feedback/ErrorCard';
import { NotFoundState } from '@/shared/components/feedback/NotFoundState';
import { AppError } from '@/shared/types/api.types';
import { routes } from '@/constants/routes';
import { useProduct } from '../hooks/useProduct';
import { VariantPanel } from '../components/VariantPanel';

export function ProductVariantsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const productId = Number(id);

  const { data: product, isLoading, isError, error, refetch } = useProduct(productId);

  const isNotFound =
    isError && error instanceof AppError && error.code === 'PRODUCT_NOT_FOUND';

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="p-6">
          <SkeletonForm fields={4} />
        </div>
      </AdminLayout>
    );
  }

  if (isNotFound) {
    return (
      <AdminLayout>
        <div className="p-6">
          <NotFoundState />
        </div>
      </AdminLayout>
    );
  }

  if (isError) {
    return (
      <AdminLayout>
        <div className="p-6">
          <ErrorCard onRetry={() => void refetch()} />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6 max-w-5xl">
        <PageHeader
          title={product?.name ? `${product.name}: Variants` : 'Variants'}
          description={`Product ID: ${productId}`}
          actions={
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate(routes.products.edit(productId))}
              leftIcon={<ArrowLeft className="h-4 w-4" />}
            >
              Back to product
            </Button>
          }
        />

        <div className="mt-6">
          <VariantPanel productId={productId} />
        </div>
      </div>
    </AdminLayout>
  );
}
