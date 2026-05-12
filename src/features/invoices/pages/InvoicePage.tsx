import { ArrowLeft, FileText } from 'lucide-react';
import { useState } from 'react';
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
import { toast } from '@/shared/stores/uiStore';
import { AppError } from '@/shared/types/api.types';
import {
  getPhase3AdminErrorMessage,
  isConcurrencyErrorCode,
} from '@/shared/utils/adminPhase3Errors';
import { InvoiceStatusUpdateModal } from '../components/InvoiceStatusUpdateModal';
import { InvoiceView } from '../components/InvoiceView';
import { useInvoice } from '../hooks/useInvoice';
import { useUpdateInvoiceStatus } from '../hooks/useUpdateInvoiceStatus';
import type { UpdateInvoiceStatusFormValues } from '../schemas/updateInvoiceStatusSchema';

export function InvoicePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const invoiceId = id ?? '';
  const [statusModalOpen, setStatusModalOpen] = useState(false);

  const { data: invoice, isLoading, isError, error, refetch } = useInvoice(invoiceId);
  const updateInvoiceStatus = useUpdateInvoiceStatus(invoiceId);
  const isNotFound = error instanceof AppError && error.code === 'INVOICE_NOT_FOUND';

  useBreadcrumbLabel(
    routes.invoices.detail(invoiceId),
    isLoading ? 'Loading...' : (invoice?.invoiceCode ?? 'Not found'),
  );

  const handleStatusUpdate = async (values: UpdateInvoiceStatusFormValues) => {
    if (updateInvoiceStatus.isPending) {
      return;
    }

    try {
      await updateInvoiceStatus.mutateAsync(values);
      toast.success('Invoice status updated.');
      setStatusModalOpen(false);
    } catch (error) {
      if (error instanceof AppError) {
        toast.error(getPhase3AdminErrorMessage(error, 'Failed to update invoice.'));

        if (error.code === 'INVOICE_STATUS_INVALID' || isConcurrencyErrorCode(error.code)) {
          void refetch();
        }
      } else {
        toast.error('Failed to update invoice. Please try again.');
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

  if (isNotFound) {
    return (
      <AdminLayout>
        <div className="p-6">
          <EmptyState
            icon={<FileText className="h-10 w-10" />}
            title="Invoice not found"
            message="This invoice does not exist or has been removed."
            action={{
              label: 'Back to Invoices',
              onClick: () => navigate(routes.invoices.list),
            }}
          />
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

  if (!invoice) {
    return (
      <AdminLayout>
        <div className="p-6">
          <EmptyState
            icon={<FileText className="h-10 w-10" />}
            title="Invoice not found"
            message="This invoice does not exist or has been removed."
            action={{
              label: 'Back to Invoices',
              onClick: () => navigate(routes.invoices.list),
            }}
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
            onClick={() => navigate(routes.invoices.list)}
            aria-label="Back to invoices"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <PageHeader
            title={invoice.invoiceCode}
            description={
              invoice.customerName
                ? `${invoice.customerName} - Order #${invoice.orderCode}`
                : `Order #${invoice.orderCode}`
            }
            actions={
              <>
                <CopyValueButton value={invoice.id} label="Copy ID" />
                <Button
                  size="sm"
                  disabled={updateInvoiceStatus.isPending}
                  onClick={() => setStatusModalOpen(true)}
                >
                  Update Status
                </Button>
              </>
            }
          />
        </div>

        <InvoiceView
          invoice={invoice}
          isUpdatingStatus={updateInvoiceStatus.isPending}
          onUpdateStatus={() => setStatusModalOpen(true)}
        />
      </div>

      <InvoiceStatusUpdateModal
        open={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        currentStatus={invoice.status}
        currentNotes={invoice.notes}
        isSubmitting={updateInvoiceStatus.isPending}
        onSubmit={(values) => void handleStatusUpdate(values)}
      />
    </AdminLayout>
  );
}
