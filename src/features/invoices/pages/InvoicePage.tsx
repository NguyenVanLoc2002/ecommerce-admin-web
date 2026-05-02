import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, FileText } from 'lucide-react';
import { AdminLayout } from '@/shared/components/layout/AdminLayout';
import { PageHeader } from '@/shared/components/layout/PageHeader';
import { useBreadcrumbLabel } from '@/shared/components/layout';
import { Button } from '@/shared/components/ui/Button';
import { CopyValueButton } from '@/shared/components/ui/CopyValueButton';
import { SkeletonDetail } from '@/shared/components/feedback/Skeleton';
import { ErrorCard } from '@/shared/components/feedback/ErrorCard';
import { EmptyState } from '@/shared/components/feedback/EmptyState';
import { toast } from '@/shared/stores/uiStore';
import { AppError } from '@/shared/types/api.types';
import { routes } from '@/constants/routes';
import { useInvoice } from '../hooks/useInvoice';
import { useUpdateInvoiceStatus } from '../hooks/useUpdateInvoiceStatus';
import { InvoiceView } from '../components/InvoiceView';
import { InvoiceStatusUpdateModal } from '../components/InvoiceStatusUpdateModal';
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
    try {
      await updateInvoiceStatus.mutateAsync(values);
      toast.success('Invoice status updated.');
      setStatusModalOpen(false);
    } catch (err) {
      if (err instanceof AppError) {
        if (err.code === 'INVOICE_STATUS_INVALID') {
          toast.error('Invoice was updated by another user. Refreshing...');
          setTimeout(() => void refetch(), 1_000);
        } else {
          toast.error(err.message || 'Failed to update invoice.');
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
                <Button size="sm" onClick={() => setStatusModalOpen(true)}>
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
