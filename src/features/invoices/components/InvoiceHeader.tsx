import type { ReactNode } from 'react';
import { Calendar, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDateTime } from '@/shared/utils/formatDate';
import { routes } from '@/constants/routes';
import type { Invoice } from '../types/invoice.types';

interface InvoiceHeaderProps {
  invoice: Invoice;
}

export function InvoiceHeader({ invoice }: InvoiceHeaderProps) {
  const billingAddress = [
    invoice.billingStreet,
    invoice.billingWard,
    invoice.billingDistrict,
    invoice.billingCity,
    invoice.billingPostalCode,
  ]
    .filter(Boolean)
    .join(', ');

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-50">
            <FileText className="h-5 w-5 text-primary-600" />
          </div>
          <div>
            <p className="font-mono text-lg font-semibold text-gray-900">{invoice.invoiceCode}</p>
            <p className="text-xs text-gray-500">
              Order{' '}
              <Link
                to={routes.orders.detail(invoice.orderId)}
                className="font-mono text-primary-600 hover:text-primary-700 hover:underline"
              >
                #{invoice.orderCode}
              </Link>
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
        <MetaItem icon={<Calendar className="h-3.5 w-3.5" />} label="Issued">
          {formatDateTime(invoice.issuedAt)}
        </MetaItem>
        <MetaItem label="Created">{formatDateTime(invoice.createdAt)}</MetaItem>
        <MetaItem label="Due">{invoice.dueDate ? formatDateTime(invoice.dueDate) : 'N/A'}</MetaItem>
      </div>

      <div className="mt-4 grid gap-4 border-t border-gray-100 pt-4 md:grid-cols-2">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Customer</p>
          <p className="mt-1 text-sm font-medium text-gray-900">{invoice.customerName}</p>
          <p className="text-xs text-gray-500">{invoice.customerEmail ?? 'N/A'}</p>
          <p className="text-xs text-gray-500">{invoice.customerPhone ?? 'N/A'}</p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Bill to</p>
          <p className="mt-1 text-sm text-gray-700">{billingAddress || 'N/A'}</p>
        </div>
      </div>
    </div>
  );
}

function MetaItem({
  icon,
  label,
  children,
}: {
  icon?: ReactNode;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex items-center gap-1.5">
      {icon && <span className="text-gray-400">{icon}</span>}
      <span className="text-xs text-gray-500">{label}:</span>
      <span className="text-xs font-medium text-gray-700">{children}</span>
    </div>
  );
}
