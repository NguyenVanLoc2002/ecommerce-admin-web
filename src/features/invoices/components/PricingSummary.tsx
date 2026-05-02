import { cn } from '@/shared/utils/cn';
import { formatMoney } from '@/shared/utils/formatMoney';

interface PricingSummaryProps {
  subTotal: number;
  discountAmount: number;
  shippingFee: number;
  totalAmount: number;
}

export function PricingSummary({
  subTotal,
  discountAmount,
  shippingFee,
  totalAmount,
}: PricingSummaryProps) {
  return (
    <div className="space-y-1.5 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
      <PriceLine label="Subtotal" value={subTotal} />
      {discountAmount > 0 && (
        <PriceLine label="Discount" value={-discountAmount} valueClass="text-success-700" />
      )}
      <PriceLine label="Shipping fee" value={shippingFee} />
      <div className="border-t border-gray-200 pt-2">
        <PriceLine
          label="Total"
          value={totalAmount}
          labelClass="font-semibold text-gray-900"
          valueClass="text-base font-bold text-gray-900"
        />
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
      <span className={cn('text-sm font-medium tabular-nums text-gray-800', valueClass)}>
        {value < 0 ? `-${formatMoney(Math.abs(value))}` : formatMoney(value)}
      </span>
    </div>
  );
}
