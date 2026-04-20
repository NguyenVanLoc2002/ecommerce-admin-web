import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { routes } from '@/constants/routes';
import { StatusBadge } from '@/shared/components/ui/StatusBadge';
import { SkeletonTable } from '@/shared/components/feedback/Skeleton';
import { ErrorCard } from '@/shared/components/feedback/ErrorCard';
import { formatMoney } from '@/shared/utils/formatMoney';
import { formatRelativeTime } from '@/shared/utils/formatDate';
import { useRecentOrders } from '../hooks/useRecentOrders';

export function RecentOrdersPanel() {
  const { data, isLoading, isError, refetch } = useRecentOrders();

  return (
    <div className="rounded-lg border border-gray-200 bg-white">
      <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
        <h2 className="text-sm font-semibold text-gray-900">Recent Orders</h2>
        <Link
          to={routes.orders.list}
          className="flex items-center gap-1 text-xs font-medium text-primary-600 hover:text-primary-700"
        >
          View all
          <ArrowRight className="h-3.5 w-3.5" aria-hidden />
        </Link>
      </div>

      {isLoading && (
        <div className="p-4">
          <SkeletonTable rows={5} />
        </div>
      )}

      {isError && (
        <ErrorCard
          message="Failed to load recent orders."
          onRetry={refetch}
          className="py-10"
        />
      )}

      {!isLoading && !isError && (
        <>
          {data?.items.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-gray-400">No orders yet.</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {data?.items.map((order) => (
                <li key={order.id}>
                  <Link
                    to={routes.orders.detail(order.id)}
                    className="flex items-center justify-between gap-4 px-5 py-3 hover:bg-gray-50 transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-gray-900">
                        {order.orderCode}
                      </p>
                      <p className="truncate text-xs text-gray-500">{order.customerName}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <StatusBadge type="order" status={order.status} />
                      <span className="text-sm font-medium text-gray-700 tabular-nums">
                        {formatMoney(order.totalAmount)}
                      </span>
                      <span className="hidden text-xs text-gray-400 sm:block">
                        {formatRelativeTime(order.createdAt)}
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
