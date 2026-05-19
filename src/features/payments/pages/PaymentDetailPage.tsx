import { ArrowLeft, CreditCard } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { routes } from '@/constants/routes';
import { EmptyState } from '@/shared/components/feedback/EmptyState';
import { ErrorCard } from '@/shared/components/feedback/ErrorCard';
import { SkeletonDetail } from '@/shared/components/feedback/Skeleton';
import { AdminLayout } from '@/shared/components/layout/AdminLayout';
import { PageHeader } from '@/shared/components/layout/PageHeader';
import { useBreadcrumbLabel } from '@/shared/components/layout';
import { Button } from '@/shared/components/ui/Button';
import { CopyValueButton } from '@/shared/components/ui/CopyValueButton';
import { useConfirmDialog } from '@/shared/hooks/useConfirmDialog';
import { toast } from '@/shared/stores/uiStore';
import { AppError } from '@/shared/types/api.types';
import {
  getPhase3AdminErrorMessage,
  isConcurrencyErrorCode,
} from '@/shared/utils/adminPhase3Errors';
import { PaymentDetail } from '../components/PaymentDetail';
import { useMarkPaymentPaid } from '../hooks/useMarkPaymentPaid';
import { usePayment } from '../hooks/usePayment';
import { usePaymentTransactions } from '../hooks/usePaymentTransactions';

export function PaymentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const paymentId = id ?? '';
  const { confirm } = useConfirmDialog();

  const { data: payment, isLoading, isError, refetch } = usePayment(paymentId);
  const {
    data: transactions,
    isLoading: transactionsLoading,
    isError: transactionsError,
    refetch: refetchTransactions,
  } = usePaymentTransactions(paymentId);
  const markPaid = useMarkPaymentPaid(paymentId);

  useBreadcrumbLabel(
    routes.payments.detail(paymentId),
    isLoading
      ? 'Loading...'
      : (payment?.paymentCode ?? (isError ? 'Loading...' : 'Not found')),
  );

  const handleMarkPaid = async () => {
    if (!payment || markPaid.isPending) {
      return;
    }

    const ok = await confirm({
      title: 'Mark payment as paid?',
      description:
        'This will record the COD payment as collected. This action cannot be undone.',
      confirmLabel: 'Mark as Paid',
      variant: 'default',
    });
    if (!ok) {
      return;
    }

    try {
      await markPaid.mutateAsync(payment.orderId);
      toast.success('Payment marked as paid.');
    } catch (error) {
      if (error instanceof AppError) {
        toast.error(getPhase3AdminErrorMessage(error, 'Failed to update payment.'));

        if (error.code === 'PAYMENT_ALREADY_PROCESSED' || isConcurrencyErrorCode(error.code)) {
          void refetch();
          void refetchTransactions();
        }
      } else {
        toast.error('Failed to update payment. Please try again.');
      }
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="p-6">
          <SkeletonDetail />
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

  if (!payment) {
    return (
      <AdminLayout>
        <div className="p-6">
          <EmptyState
            icon={<CreditCard className="h-10 w-10" />}
            title="Payment not found"
            message="This payment doesn't exist or has been removed."
            action={{ label: 'Back to Payments', onClick: () => navigate(routes.payments.list) }}
          />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6 p-6">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => navigate(routes.payments.list)}
            aria-label="Back to payments"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <PageHeader
            title={payment.paymentCode || 'Payment Details'}
            description={`Order #${payment.orderCode} - ${payment.customer.fullName}`}
            actions={<CopyValueButton value={payment.id} label="Copy ID" />}
          />
        </div>

        <PaymentDetail
          payment={payment}
          transactions={transactions}
          transactionsLoading={transactionsLoading}
          transactionsError={transactionsError}
          onRetryTransactions={() => void refetchTransactions()}
          isMarkingPaid={markPaid.isPending}
          onMarkPaid={() => void handleMarkPaid()}
        />
      </div>
    </AdminLayout>
  );
}
