import { Package } from 'lucide-react';
import { formatMoney } from '@/shared/utils/formatMoney';
import type { InvoiceLineItem } from '../types/invoice.types';

interface LineItemsTableProps {
  items: InvoiceLineItem[];
}

export function LineItemsTable({ items }: LineItemsTableProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
      <div className="border-b border-gray-100 px-4 py-3">
        <p className="text-sm font-semibold text-gray-900">
          Items ({items.length})
        </p>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <Package className="h-8 w-8 text-gray-300" />
          <p className="mt-2 text-sm text-gray-400">No line items</p>
        </div>
      ) : (
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500">
                Product
              </th>
              <th className="px-4 py-2.5 text-right text-xs font-medium text-gray-500">
                Unit Price
              </th>
              <th className="px-4 py-2.5 text-right text-xs font-medium text-gray-500">
                Qty
              </th>
              <th className="px-4 py-2.5 text-right text-xs font-medium text-gray-500">
                Discount
              </th>
              <th className="px-4 py-2.5 text-right text-xs font-medium text-gray-500">
                Total
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-gray-100 bg-gray-50">
                      <Package className="h-4 w-4 text-gray-300" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-medium text-gray-900">
                        {item.productName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {item.variantName}
                        {' · '}
                        <span className="font-mono">{item.sku}</span>
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-gray-700">
                  {formatMoney(item.unitPrice)}
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-gray-700">
                  {item.quantity}
                </td>
                <td className="px-4 py-3 text-right tabular-nums">
                  {item.discountAmount > 0 ? (
                    <span className="text-success-600">
                      −{formatMoney(item.discountAmount)}
                    </span>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right tabular-nums font-semibold text-gray-900">
                  {formatMoney(item.lineTotal)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      )}
    </div>
  );
}
