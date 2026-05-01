import { CreditCard, MapPin, ReceiptText, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { StatusBadge } from '@/shared/components/ui/StatusBadge';
import { formatDateTime } from '@/shared/utils/formatDate';
import { formatEnumLabel } from '@/shared/utils/formatEnumLabel';
import { formatMoney } from '@/shared/utils/formatMoney';
import { routes } from '@/constants/routes';
import { InvoiceActionPanel } from './InvoiceActionPanel';
import { InvoiceHeader } from './InvoiceHeader';
import { LineItemsTable } from './LineItemsTable';
import { PricingSummary } from './PricingSummary';
import { VoidedWatermark } from './VoidedWatermark';
import type { Invoice } from '../types/invoice.types';

interface InvoiceViewProps {
  invoice: Invoice;
  isUpdatingStatus: boolean;
  onUpdateStatus: () => void;
}

export function InvoiceView({
  invoice,
  isUpdatingStatus,
  onUpdateStatus,
}: InvoiceViewProps) {
  return (
    <div className="space-y-4">
      <InvoiceActionPanel
        status={invoice.status}
        isUpdatingStatus={isUpdatingStatus}
        onUpdateStatus={onUpdateStatus}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="relative overflow-hidden lg:col-span-2">
          {invoice.status === 'VOIDED' && <VoidedWatermark />}

          <div className="space-y-4">
            <InvoiceHeader invoice={invoice} />
            <LineItemsTable items={invoice.lineItems} />
            <PricingSummary
              subTotal={invoice.subTotal}
              discountAmount={invoice.discountAmount}
              shippingFee={invoice.shippingFee}
              totalAmount={invoice.totalAmount}
            />
            {invoice.notes && (
              <div className="rounded-lg border border-gray-200 bg-white p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Notes</p>
                <p className="mt-2 whitespace-pre-wrap text-sm text-gray-700">{invoice.notes}</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <InvoiceTotalCard invoice={invoice} />
          <OrderLinkCard invoice={invoice} />
          <PaymentInfoCard invoice={invoice} />
          <BillingInfoCard invoice={invoice} />
          <TimelineCard invoice={invoice} />
        </div>
      </div>
    </div>
  );
}

function InvoiceTotalCard({ invoice }: { invoice: Invoice }) {
  return (
    <div className="space-y-3 rounded-lg border border-gray-200 bg-white p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Amount Due</p>
      <p className="text-2xl font-bold tabular-nums text-gray-900">
        {formatMoney(invoice.totalAmount)}
      </p>
      {invoice.voucherCode && (
        <p className="text-xs text-gray-500">
          Voucher <span className="font-mono text-gray-700">{invoice.voucherCode}</span>
        </p>
      )}
      {invoice.discountAmount > 0 && (
        <p className="text-xs text-success-600">
          -{formatMoney(invoice.discountAmount)} discount applied
        </p>
      )}
    </div>
  );
}

function OrderLinkCard({ invoice }: { invoice: Invoice }) {
  return (
    <div className="space-y-3 rounded-lg border border-gray-200 bg-white p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Linked Order</p>

      <div className="space-y-1.5">
        <p className="text-sm font-medium text-gray-900">
          Order{' '}
          <Link
            to={routes.orders.detail(invoice.orderId)}
            className="font-mono text-primary-600 hover:text-primary-700 hover:underline"
          >
            #{invoice.orderCode}
          </Link>
        </p>

        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <User className="h-3.5 w-3.5 text-gray-400" />
          {invoice.customerName}
        </div>
        {invoice.customerPhone && <p className="text-xs text-gray-400">{invoice.customerPhone}</p>}
      </div>
    </div>
  );
}

function PaymentInfoCard({ invoice }: { invoice: Invoice }) {
  return (
    <div className="space-y-3 rounded-lg border border-gray-200 bg-white p-4">
      <div className="flex items-center gap-2">
        <CreditCard className="h-4 w-4 text-gray-400" />
        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Payment</p>
      </div>

      <InfoRow
        label="Method"
        value={invoice.paymentMethod ? formatEnumLabel(invoice.paymentMethod) : 'Not available'}
      />
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm text-gray-500">Status</span>
        {invoice.paymentStatus ? (
          <StatusBadge type="order-payment" status={invoice.paymentStatus} />
        ) : (
          <span className="text-sm text-gray-400">Not available</span>
        )}
      </div>
      <InfoRow
        label="Paid at"
        value={invoice.paidAt ? formatDateTime(invoice.paidAt) : 'Not available'}
      />
    </div>
  );
}

function BillingInfoCard({ invoice }: { invoice: Invoice }) {
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
    <div className="space-y-3 rounded-lg border border-gray-200 bg-white p-4">
      <div className="flex items-center gap-2">
        <MapPin className="h-4 w-4 text-gray-400" />
        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
          Billing Address
        </p>
      </div>

      <InfoRow label="Customer" value={invoice.customerName} />
      <InfoRow label="Email" value={invoice.customerEmail ?? 'Not available'} />
      <InfoRow label="Phone" value={invoice.customerPhone ?? 'Not available'} />
      <p className="text-sm leading-relaxed text-gray-700">{billingAddress || 'Not available'}</p>
    </div>
  );
}

function TimelineCard({ invoice }: { invoice: Invoice }) {
  return (
    <div className="space-y-3 rounded-lg border border-gray-200 bg-white p-4">
      <div className="flex items-center gap-2">
        <ReceiptText className="h-4 w-4 text-gray-400" />
        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
          Invoice Details
        </p>
      </div>

      <InfoRow label="Issued at" value={formatDateTime(invoice.issuedAt)} />
      <InfoRow
        label="Due date"
        value={invoice.dueDate ? formatDateTime(invoice.dueDate) : 'Not available'}
      />
      <InfoRow label="Created at" value={formatDateTime(invoice.createdAt)} />
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-right text-sm text-gray-700">{value}</span>
    </div>
  );
}
