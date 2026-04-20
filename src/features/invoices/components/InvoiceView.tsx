import { User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatMoney } from '@/shared/utils/formatMoney';
import { routes } from '@/constants/routes';
import { InvoiceHeader } from './InvoiceHeader';
import { LineItemsTable } from './LineItemsTable';
import { PricingSummary } from './PricingSummary';
import { InvoiceActionPanel } from './InvoiceActionPanel';
import { VoidedWatermark } from './VoidedWatermark';
import type { Invoice } from '../types/invoice.types';

interface InvoiceViewProps {
  invoice: Invoice;
  isMarkingPaid: boolean;
  isVoiding: boolean;
  onMarkPaid: () => void;
  onVoid: () => void;
}

export function InvoiceView({
  invoice,
  isMarkingPaid,
  isVoiding,
  onMarkPaid,
  onVoid,
}: InvoiceViewProps) {
  return (
    <div className="space-y-4">
      <InvoiceActionPanel
        status={invoice.status}
        isMarkingPaid={isMarkingPaid}
        isVoiding={isVoiding}
        onMarkPaid={onMarkPaid}
        onVoid={onVoid}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Invoice document — left / main area */}
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
          </div>
        </div>

        {/* Sidebar — right */}
        <div className="space-y-4">
          <InvoiceTotalCard invoice={invoice} />
          <OrderLinkCard invoice={invoice} />
        </div>
      </div>
    </div>
  );
}

function InvoiceTotalCard({ invoice }: { invoice: Invoice }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 space-y-3">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
        Amount Due
      </p>
      <p className="text-2xl font-bold tabular-nums text-gray-900">
        {formatMoney(invoice.totalAmount)}
      </p>
      {invoice.discountAmount > 0 && (
        <p className="text-xs text-success-600">
          −{formatMoney(invoice.discountAmount)} discount applied
        </p>
      )}
    </div>
  );
}

function OrderLinkCard({ invoice }: { invoice: Invoice }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 space-y-3">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
        Linked Order
      </p>

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
          {invoice.receiverName}
        </div>
        <p className="text-xs text-gray-400">{invoice.receiverPhone}</p>
      </div>
    </div>
  );
}

