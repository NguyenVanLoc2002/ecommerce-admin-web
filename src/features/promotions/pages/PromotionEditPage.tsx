import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { AdminLayout } from '@/shared/components/layout/AdminLayout';
import { PageHeader } from '@/shared/components/layout/PageHeader';
import { useBreadcrumbLabel } from '@/shared/components/layout';
import { Button } from '@/shared/components/ui/Button';
import { SkeletonTable } from '@/shared/components/feedback/Skeleton';
import { ErrorCard } from '@/shared/components/feedback/ErrorCard';
import { NotFoundState } from '@/shared/components/feedback/NotFoundState';
import { AppError } from '@/shared/types/api.types';
import { usePermission } from '@/constants/permissions';
import { routes } from '@/constants/routes';
import { usePromotion } from '../hooks/usePromotion';
import { PromotionForm } from '../components/PromotionForm';
import { RuleList } from '../components/RuleList';

export function PromotionEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const canWrite = usePermission('promotions', 'write');
  const isEditMode = id !== undefined;
  const promotionId = id;

  const {
    data: promotion,
    isLoading,
    isError,
    error,
    refetch,
  } = usePromotion(promotionId ?? '');

  const isNotFound =
    isEditMode && isError && error instanceof AppError && error.code === 'PROMOTION_NOT_FOUND';

  const handleSuccess = () => {
    navigate(routes.promotions.list);
  };

  const pageTitle = isEditMode
    ? (isNotFound ? 'Not found' : (promotion?.name ?? 'Loading...'))
    : 'New Promotion';

  useBreadcrumbLabel(
    promotionId ? routes.promotions.edit(promotionId) : undefined,
    isEditMode ? pageTitle : undefined,
  );

  return (
    <AdminLayout>
      <div className="space-y-6 p-6">
        <PageHeader
          title={pageTitle}
          description={
            isEditMode
              ? 'Update promotion details and manage eligibility rules.'
              : 'Create a new promotion to offer discounts to customers.'
          }
          actions={
            <Button
              variant="secondary"
              onClick={() => navigate(routes.promotions.list)}
              leftIcon={<ArrowLeft className="h-4 w-4" />}
            >
              Back to Promotions
            </Button>
          }
        />

        {isEditMode && isLoading && <SkeletonTable rows={6} />}
        {isEditMode && isNotFound && (
          <NotFoundState
            title="Promotion Not Found"
            message="Promotion not found or has been deleted."
          />
        )}
        {isEditMode && isError && !isNotFound && <ErrorCard onRetry={() => void refetch()} />}

        {(!isEditMode || (!isLoading && !isError && promotion)) && (
          <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-base font-semibold text-gray-900 mb-6">
                {isEditMode ? 'Promotion Details' : 'New Promotion'}
              </h2>
              <PromotionForm
                promotion={isEditMode ? promotion : undefined}
                onSuccess={handleSuccess}
              />
            </div>

            {isEditMode && promotion && (
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <RuleList
                  promotionId={promotion.id}
                  rules={promotion.rules}
                  canWrite={canWrite}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
