import { FileText, Calendar, CheckCircle, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDateTime } from '@/shared/utils/formatDate';
import { routes } from '@/constants/routes';
import type { Invoice } from '../types/invoice.types';

interface InvoiceHeaderProps {
  invoice: Invoice;
}

export function InvoiceHeader({ invoice }: InvoiceHeaderProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-50">
            <FileText className="h-5 w-5 text-primary-600" />
          </div>
          <div>
            <p className="font-mono text-lg font-semibold text-gray-900">
              {invoice.invoiceCode}
            </p>
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

        {invoice.paidAt && (
          <MetaItem icon={<CheckCircle className="h-3.5 w-3.5 text-success-500" />} label="Paid">
            {formatDateTime(invoice.paidAt)}
          </MetaItem>
        )}

        {invoice.voidedAt && (
          <MetaItem icon={<XCircle className="h-3.5 w-3.5 text-danger-500" />} label="Voided">
            {formatDateTime(invoice.voidedAt)}
          </MetaItem>
        )}
      </div>

      {invoice.voidNote && (
        <div className="mt-3 rounded border border-danger-100 bg-danger-50 px-3 py-2">
          <p className="text-xs font-medium text-danger-700">Void reason</p>
          <p className="mt-0.5 text-xs text-danger-600">{invoice.voidNote}</p>
        </div>
      )}

      <div className="mt-4 border-t border-gray-100 pt-3">
        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
          Ship to
        </p>
        <p className="mt-1 text-sm font-medium text-gray-900">{invoice.receiverName}</p>
        <p className="text-xs text-gray-500">{invoice.receiverPhone}</p>
        <p className="text-xs text-gray-500">
          {[invoice.shippingStreet, invoice.shippingWard, invoice.shippingDistrict, invoice.shippingCity]
            .filter(Boolean)
            .join(', ')}
        </p>
      </div>
    </div>
  );
}

function MetaItem({
  icon,
  label,
  children,
}: {
  icon?: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-1.5">
      {icon && <span className="text-gray-400">{icon}</span>}
      <span className="text-xs text-gray-500">{label}:</span>
      <span className="text-xs font-medium text-gray-700">{children}</span>
    </div>
  );
}
