import { Package } from 'lucide-react';
import { formatMoney } from '@/shared/utils/formatMoney';
import { cn } from '@/shared/utils/cn';
import type { OrderItem } from '../types/order.types';

interface OrderItemsTableProps {
  items: OrderItem[];
  subtotal: number;
  discountAmount: number;
  shippingFee: number;
  total: number;
  voucherCode: string | null;
}

export function OrderItemsTable({
  items,
  subtotal,
  discountAmount,
  shippingFee,
  total,
  voucherCode,
}: OrderItemsTableProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100">
        <p className="text-sm font-semibold text-gray-900">
          Items ({items.length})
        </p>
      </div>

      <div className="divide-y divide-gray-100">
        {items.map((item) => (
          <div key={item.id} className="flex items-start gap-3 px-4 py-3">
            {/* Thumbnail */}
            <div className="h-12 w-12 shrink-0 overflow-hidden rounded-md border border-gray-100 bg-gray-50">
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt={item.variantName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <Package className="h-5 w-5 text-gray-300" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-900 truncate">{item.productName}</p>
              <p className="text-xs text-gray-500">
                {item.variantName}
                {' · '}
                <span className="font-mono">{item.variantSku}</span>
              </p>
              <p className="mt-0.5 text-xs text-gray-400">
                {formatMoney(item.unitPrice)} × {item.quantity}
                {item.discount > 0 && (
                  <span className="ml-1 text-success-600">
                    (−{formatMoney(item.discount)})
                  </span>
                )}
              </p>
            </div>

            {/* Total */}
            <p className="shrink-0 text-sm font-semibold text-gray-900 tabular-nums">
              {formatMoney(item.total)}
            </p>
          </div>
        ))}
      </div>

      {/* Price breakdown */}
      <div className="border-t border-gray-200 bg-gray-50 px-4 py-3 space-y-1.5">
        <PriceLine label="Subtotal" value={subtotal} />
        {discountAmount > 0 && (
          <PriceLine
            label={voucherCode ? `Discount (${voucherCode})` : 'Discount'}
            value={-discountAmount}
            valueClass="text-success-700"
          />
        )}
        <PriceLine label="Shipping fee" value={shippingFee} />
        <div className="pt-2 border-t border-gray-200">
          <PriceLine label="Total" value={total} labelClass="font-semibold text-gray-900" valueClass="font-bold text-gray-900 text-base" />
        </div>
      </div>
    </div>
  );
}

function PriceLine({
  label,
  value,
  labelClass,
  valueClass,
}: {
  label: string;
  value: number;
  labelClass?: string;
  valueClass?: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className={cn('text-sm text-gray-500', labelClass)}>{label}</span>
      <span className={cn('text-sm font-medium text-gray-800 tabular-nums', valueClass)}>
        {value < 0 ? `−${formatMoney(Math.abs(value))}` : formatMoney(value)}
      </span>
    </div>
  );
}
