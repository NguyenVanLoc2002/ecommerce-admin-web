import { FileText } from 'lucide-react';
import { AdminLayout } from '@/shared/components/layout/AdminLayout';
import { PageHeader } from '@/shared/components/layout/PageHeader';
import { EmptyState } from '@/shared/components/feedback/EmptyState';

export function InvoiceListPage() {
  return (
    <AdminLayout>
      <div className="space-y-6 p-6">
        <PageHeader
          title="Invoices"
          description="View and manage all invoice records."
        />

        <EmptyState
          icon={<FileText className="h-10 w-10" />}
          title="Invoice list coming soon"
          message="Browse, filter, and manage invoices. This screen will be available in a future phase."
        />
      </div>
    </AdminLayout>
  );
}
