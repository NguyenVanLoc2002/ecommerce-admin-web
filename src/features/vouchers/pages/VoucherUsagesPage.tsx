import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { AdminLayout } from '@/shared/components/layout/AdminLayout';
import { PageHeader } from '@/shared/components/layout/PageHeader';
import { Button } from '@/shared/components/ui/Button';
import { Badge } from '@/shared/components/ui/Badge';
import { SkeletonTable } from '@/shared/components/feedback/Skeleton';
import { ErrorCard } from '@/shared/components/feedback/ErrorCard';
import { formatMoney } from '@/shared/utils/formatMoney';
import { formatDate } from '@/shared/utils/formatDate';
import { routes } from '@/constants/routes';
import { useVoucher } from '../hooks/useVoucher';
import { useVoucherUsages } from '../hooks/useVoucherUsages';
import { VoucherUsageTable } from '../components/VoucherUsageTable';

export function VoucherUsagesPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const voucherId = id ? Number(id) : 0;

  const [page, setPage] = useState(0);
  const [size] = useState(20);

  const {
    data: voucher,
    isLoading: voucherLoading,
    isError: voucherError,
    refetch: refetchVoucher,
  } = useVoucher(voucherId);

  const {
    data: usages,
    isLoading: usagesLoading,
    isError: usagesError,
    refetch: refetchUsages,
  } = useVoucherUsages(voucherId, { page, size });

  return (
    <AdminLayout>
      <div className="space-y-6 p-6">
        <PageHeader
          title="Voucher Usages"
          description="All redemptions recorded for this voucher code."
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

        {voucherLoading && <SkeletonTable rows={3} />}
        {!voucherLoading && voucherError && (
          <ErrorCard onRetry={() => void refetchVoucher()} />
        )}

        {!voucherLoading && !voucherError && voucher && (
          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <div className="flex flex-wrap items-center gap-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Code</p>
                <p className="mt-0.5 font-mono text-lg font-bold text-gray-900">{voucher.code}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Promotion</p>
                <p className="mt-0.5 text-sm text-gray-700">{voucher.promotionName}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Discount</p>
                <p className="mt-0.5 text-sm text-gray-700">
                  {voucher.discountType === 'PERCENTAGE'
                    ? `${voucher.discountValue}%`
                    : formatMoney(voucher.discountValue)}{' '}
                  off
                </p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Usage</p>
                <p className="mt-0.5 text-sm tabular-nums text-gray-700">
                  {voucher.usageCount} / {voucher.usageLimit ?? '∞'}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Date Range</p>
                <p className="mt-0.5 text-xs text-gray-500">
                  {formatDate(voucher.startDate)} – {formatDate(voucher.endDate)}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Status</p>
                <div className="mt-0.5">
                  {voucher.active ? (
                    <Badge variant="success">Active</Badge>
                  ) : (
                    <Badge variant="neutral">Inactive</Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Redemption History</h2>
          <VoucherUsageTable
            data={usages}
            isLoading={usagesLoading}
            isError={usagesError}
            onRetry={() => void refetchUsages()}
            onPageChange={setPage}
            onPageSizeChange={() => {}}
          />
        </div>
      </div>
    </AdminLayout>
  );
}
