import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, FileText } from 'lucide-react';
import { AdminLayout } from '@/shared/components/layout/AdminLayout';
import { PageHeader } from '@/shared/components/layout/PageHeader';
import { Button } from '@/shared/components/ui/Button';
import { SkeletonDetail } from '@/shared/components/feedback/Skeleton';
import { ErrorCard } from '@/shared/components/feedback/ErrorCard';
import { EmptyState } from '@/shared/components/feedback/EmptyState';
import { useConfirmDialog } from '@/shared/hooks/useConfirmDialog';
import { toast } from '@/shared/stores/uiStore';
import { AppError } from '@/shared/types/api.types';
import { routes } from '@/constants/routes';
import { useInvoice } from '../hooks/useInvoice';
import { useMarkInvoicePaid } from '../hooks/useMarkInvoicePaid';
import { useVoidInvoice } from '../hooks/useVoidInvoice';
import { InvoiceView } from '../components/InvoiceView';
import { VoidInvoiceModal } from '../components/VoidInvoiceModal';

export function InvoicePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const invoiceId = Number(id);
  const { confirm } = useConfirmDialog();
  const [voidModalOpen, setVoidModalOpen] = useState(false);

  const { data: invoice, isLoading, isError, refetch } = useInvoice(invoiceId);
  const markPaid = useMarkInvoicePaid(invoiceId);
  const voidInvoice = useVoidInvoice(invoiceId);

  const handleMarkPaid = async () => {
    const ok = await confirm({
      title: 'Mark invoice as paid?',
      description: 'This will record the invoice as collected. This action cannot be undone.',
      confirmLabel: 'Mark as Paid',
      variant: 'default',
    });
    if (!ok) return;

    try {
      await markPaid.mutateAsync();
      toast.success('Invoice marked as paid.');
    } catch (err) {
      if (err instanceof AppError) {
        if (err.code === 'INVOICE_STATUS_INVALID') {
          toast.error('Invoice was updated by another user. Refreshing…');
          setTimeout(() => void refetch(), 1_000);
        } else {
          toast.error(err.message || 'Failed to update invoice.');
        }
      } else {
        toast.error('Failed to update invoice. Please try again.');
      }
    }
  };

  const handleVoid = async (note: string) => {
    try {
      await voidInvoice.mutateAsync(note);
      toast.success('Invoice voided successfully.');
      setVoidModalOpen(false);
    } catch (err) {
      if (err instanceof AppError) {
        if (err.code === 'INVOICE_STATUS_INVALID') {
          toast.error('Invoice was updated by another user. Refreshing…');
          setTimeout(() => void refetch(), 1_000);
          setVoidModalOpen(false);
        } else {
          toast.error(err.message || 'Failed to void invoice.');
        }
      } else {
        toast.error('Failed to void invoice. Please try again.');
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

  if (!invoice) {
    return (
      <AdminLayout>
        <div className="p-6">
          <EmptyState
            icon={<FileText className="h-10 w-10" />}
            title="Invoice not found"
            message="This invoice doesn't exist or has been removed."
            action={{
              label: 'Back to Orders',
              onClick: () => navigate(routes.orders.list),
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
            onClick={() => navigate(routes.orders.detail(invoice.orderId))}
            aria-label="Back to order"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <PageHeader
            title={invoice.invoiceCode}
            description={`Order #${invoice.orderCode}`}
          />
        </div>

        <InvoiceView
          invoice={invoice}
          isMarkingPaid={markPaid.isPending}
          isVoiding={voidInvoice.isPending}
          onMarkPaid={() => void handleMarkPaid()}
          onVoid={() => setVoidModalOpen(true)}
        />
      </div>

      <VoidInvoiceModal
        open={voidModalOpen}
        onClose={() => setVoidModalOpen(false)}
        isSubmitting={voidInvoice.isPending}
        onSubmit={(note) => void handleVoid(note)}
      />
    </AdminLayout>
  );
}
