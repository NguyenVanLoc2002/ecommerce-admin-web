import { useNavigate } from 'react-router-dom';
import {
  ShoppingCart,
  CreditCard,
  Clock,
  Star,
  AlertTriangle,
  Truck,
} from 'lucide-react';
import { AdminLayout } from '@/shared/components/layout/AdminLayout';
import { PageHeader } from '@/shared/components/layout/PageHeader';
import { routes } from '@/constants/routes';
import { formatMoneyCompact } from '@/shared/utils/formatMoney';
import { KpiCard } from '../components/KpiCard';
import { RecentOrdersPanel } from '../components/RecentOrdersPanel';
import { PendingReviewsPanel } from '../components/PendingReviewsPanel';
import { LowStockPanel } from '../components/LowStockPanel';
import {
  useTodayOrderStats,
  usePendingOrderStats,
  useTodayPaidPaymentStats,
  usePendingReviewStats,
  useLowStockStats,
  useOutForDeliveryStats,
} from '../hooks/useDashboardStats';

export function DashboardPage() {
  const navigate = useNavigate();

  const todayOrders = useTodayOrderStats();
  const pendingOrders = usePendingOrderStats();
  const todayPayments = useTodayPaidPaymentStats();
  const pendingReviews = usePendingReviewStats();
  const lowStock = useLowStockStats();
  const outForDelivery = useOutForDeliveryStats();

  const todayRevenue = todayPayments.data?.items.reduce(
    (sum, p) => sum + (p.amount ?? 0),
    0,
  );

  return (
    <AdminLayout>
      <PageHeader
        title="Dashboard"
        description="Overview of your store's performance today."
      />

      <div className="mt-6 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
          <KpiCard
            title="Orders Today"
            value={todayOrders.data?.totalItems ?? 0}
            icon={ShoppingCart}
            iconBg="bg-primary-50"
            iconColor="text-primary-600"
            description="New orders placed today"
            onClick={() => navigate(routes.orders.list)}
            isLoading={todayOrders.isLoading}
            isError={todayOrders.isError}
            onRetry={todayOrders.refetch}
          />
          <KpiCard
            title="Revenue Today"
            value={
              todayPayments.isError
                ? '—'
                : todayRevenue !== undefined
                ? formatMoneyCompact(todayRevenue)
                : '0 ₫'
            }
            icon={CreditCard}
            iconBg="bg-success-50"
            iconColor="text-success-600"
            description="From paid orders today"
            onClick={() => navigate(routes.payments.list)}
            isLoading={todayPayments.isLoading}
            isError={todayPayments.isError}
            onRetry={todayPayments.refetch}
          />
          <KpiCard
            title="Pending Confirmation"
            value={pendingOrders.data?.totalItems ?? 0}
            icon={Clock}
            iconBg="bg-warning-50"
            iconColor="text-warning-600"
            description="Orders awaiting confirmation"
            onClick={() => navigate(routes.orders.list)}
            isLoading={pendingOrders.isLoading}
            isError={pendingOrders.isError}
            onRetry={pendingOrders.refetch}
          />
          <KpiCard
            title="Pending Reviews"
            value={pendingReviews.data?.totalItems ?? 0}
            icon={Star}
            iconBg="bg-info-50"
            iconColor="text-info-600"
            description="Reviews waiting moderation"
            onClick={() => navigate(routes.reviews.list)}
            isLoading={pendingReviews.isLoading}
            isError={pendingReviews.isError}
            onRetry={pendingReviews.refetch}
          />
          <KpiCard
            title="Low Stock"
            value={lowStock.data?.totalItems ?? 0}
            icon={AlertTriangle}
            iconBg="bg-danger-50"
            iconColor="text-danger-600"
            description="Variants with ≤5 units"
            onClick={() => navigate(routes.inventory.stock)}
            isLoading={lowStock.isLoading}
            isError={lowStock.isError}
            onRetry={lowStock.refetch}
          />
          <KpiCard
            title="Out for Delivery"
            value={outForDelivery.data?.totalItems ?? 0}
            icon={Truck}
            iconBg="bg-primary-50"
            iconColor="text-primary-600"
            description="Shipments en route"
            onClick={() => navigate(routes.shipments.list)}
            isLoading={outForDelivery.isLoading}
            isError={outForDelivery.isError}
            onRetry={outForDelivery.refetch}
          />
        </div>

        {/* Panels */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <RecentOrdersPanel />
          <PendingReviewsPanel />
        </div>

        <LowStockPanel />
      </div>
    </AdminLayout>
  );
}
