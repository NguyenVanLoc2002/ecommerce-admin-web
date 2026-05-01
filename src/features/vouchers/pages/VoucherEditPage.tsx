import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { AdminLayout } from '@/shared/components/layout/AdminLayout';
import { PageHeader } from '@/shared/components/layout/PageHeader';
import { useBreadcrumbLabel } from '@/shared/components/layout';
import { Button } from '@/shared/components/ui/Button';
import { SkeletonTable } from '@/shared/components/feedback/Skeleton';
import { ErrorCard } from '@/shared/components/feedback/ErrorCard';
import { NotFoundState } from '@/shared/components/feedback/NotFoundState';
import { apiClient } from '@/shared/lib/axios';
import { routes } from '@/constants/routes';
import { AppError, type PaginatedResponse } from '@/shared/types/api.types';
import { toSoftDeleteQuery } from '@/shared/utils/softDelete';
import { useVoucher } from '../hooks/useVoucher';
import { VoucherForm } from '../components/VoucherForm';

interface PromotionOption {
  id: string;
  name: string;
}

export function VoucherEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = id !== undefined;
  const voucherId = id;

  const {
    data: voucher,
    isLoading: voucherLoading,
    isError: hasVoucherError,
    error: voucherError,
    refetch: refetchVoucher,
  } = useVoucher(voucherId);

  const {
    data: promotionsData,
    isLoading: promotionsLoading,
    isError: promotionsError,
    refetch: refetchPromotions,
  } = useQuery({
    queryKey: ['promotions', 'options'],
    queryFn: () =>
      apiClient.get<PaginatedResponse<PromotionOption>>('/admin/promotions', {
        params: { page: 0, size: 200, sort: 'name,asc', active: true, ...toSoftDeleteQuery() },
      }),
    staleTime: 60_000,
  });

  const handleSuccess = () => {
    navigate(routes.vouchers.list);
  };

  const isLoading = (isEditMode && voucherLoading) || promotionsLoading;
  const isError = (isEditMode && hasVoucherError) || promotionsError;
  const isNotFound =
    isEditMode && voucherError instanceof AppError && voucherError.code === 'VOUCHER_NOT_FOUND';

  const promotionOptions = [
    ...(promotionsData?.items.map((p) => ({
      value: String(p.id),
      label: p.name,
    })) ?? []),
  ];

  if (
    isEditMode &&
    voucher &&
    !promotionOptions.some((option) => option.value === String(voucher.promotionId))
  ) {
    promotionOptions.unshift({
      value: String(voucher.promotionId),
      label: voucher.promotionName,
    });
  }

  const handleRetry = () => {
    if (isEditMode && hasVoucherError) void refetchVoucher();
    if (promotionsError) void refetchPromotions();
  };

  const pageTitle = isEditMode
    ? (isNotFound ? 'Not found' : (voucher?.code ?? 'Loading...'))
    : 'New Voucher';

  useBreadcrumbLabel(
    voucherId ? routes.vouchers.edit(voucherId) : undefined,
    isEditMode ? pageTitle : undefined,
  );

  return (
    <AdminLayout>
      <div className="space-y-6 p-6">
        <PageHeader
          title={pageTitle}
          description={
            isEditMode
              ? 'Update voucher settings. Code and promotion cannot be changed.'
              : 'Create a new voucher code linked to a promotion.'
          }
          actions={
            <Button
              variant="secondary"
              onClick={() => navigate(routes.vouchers.list)}
              leftIcon={<ArrowLeft className="h-4 w-4" />}
            >
              Back to Vouchers
            </Button>
          }
        />

        {isLoading && <SkeletonTable rows={6} />}
        {!isLoading && isNotFound && (
          <NotFoundState
            title="Voucher Not Found"
            message="Voucher not found or has been deleted."
          />
        )}
        {!isLoading && isError && !isNotFound && <ErrorCard onRetry={handleRetry} />}

        {!isLoading && !isError && (!isEditMode || voucher) && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <VoucherForm
              voucher={isEditMode ? voucher : undefined}
              promotionOptions={promotionOptions}
              onSuccess={handleSuccess}
            />
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
