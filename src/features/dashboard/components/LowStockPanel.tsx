import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import { routes } from '@/constants/routes';
import { SkeletonTable } from '@/shared/components/feedback/Skeleton';
import { ErrorCard } from '@/shared/components/feedback/ErrorCard';
import { useDashboardLowStock } from '../hooks/useDashboardLowStock';

export function LowStockPanel() {
  const { data, isLoading, isError, refetch } = useDashboardLowStock();

  return (
    <div className="rounded-lg border border-gray-200 bg-white">
      <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
        <h2 className="text-sm font-semibold text-gray-900">Low Stock Alerts</h2>
        <Link
          to={routes.inventory.stock}
          className="flex items-center gap-1 text-xs font-medium text-primary-600 hover:text-primary-700"
        >
          Manage inventory
          <ArrowRight className="h-3.5 w-3.5" aria-hidden />
        </Link>
      </div>

      {isLoading && (
        <div className="p-4">
          <SkeletonTable rows={4} />
        </div>
      )}

      {isError && (
        <ErrorCard
          message="Failed to load low stock items."
          onRetry={refetch}
          className="py-10"
        />
      )}

      {!isLoading && !isError && (
        <>
          {data?.items.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-gray-400">
              All stock levels are healthy.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="px-5 py-2.5 text-left text-xs font-medium text-gray-500">
                      Variant
                    </th>
                    <th className="px-5 py-2.5 text-left text-xs font-medium text-gray-500">
                      SKU
                    </th>
                    <th className="px-5 py-2.5 text-left text-xs font-medium text-gray-500">
                      Warehouse
                    </th>
                    <th className="px-5 py-2.5 text-right text-xs font-medium text-gray-500">
                      On Hand
                    </th>
                    <th className="px-5 py-2.5 text-right text-xs font-medium text-gray-500">
                      Reserved
                    </th>
                    <th className="px-5 py-2.5 text-right text-xs font-medium text-gray-500">
                      Available
                    </th>
                    <th className="px-5 py-2.5 text-right text-xs font-medium text-gray-500" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data?.items.map((item) => (
                    <tr key={`${item.variantId}-${item.warehouseId}`} className="hover:bg-gray-50">
                      <td className="px-5 py-3">
                        <p className="font-medium text-gray-900">{item.variantName}</p>
                        <p className="text-xs text-gray-500">{item.productName}</p>
                      </td>
                      <td className="px-5 py-3 font-mono text-xs text-gray-600">{item.sku}</td>
                      <td className="px-5 py-3 text-gray-600">{item.warehouseName}</td>
                      <td className="px-5 py-3 text-right tabular-nums text-gray-700">
                        {item.onHand}
                      </td>
                      <td className="px-5 py-3 text-right tabular-nums text-gray-500">
                        {item.reserved}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <span
                          className={cn(
                            'inline-block min-w-[2rem] rounded px-1.5 py-0.5 text-right text-xs font-semibold tabular-nums',
                            item.available === 0
                              ? 'bg-danger-50 text-danger-700'
                              : item.available <= 5
                              ? 'bg-danger-50 text-danger-700'
                              : 'bg-warning-50 text-warning-700',
                          )}
                        >
                          {item.available}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <Link
                          to={routes.inventory.stock}
                          className="text-xs font-medium text-primary-600 hover:text-primary-700"
                        >
                          Import Stock
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
