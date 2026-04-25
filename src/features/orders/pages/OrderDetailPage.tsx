import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ShoppingBag } from 'lucide-react';
import { AdminLayout } from '@/shared/components/layout/AdminLayout';
import { PageHeader } from '@/shared/components/layout/PageHeader';
import { Button } from '@/shared/components/ui/Button';
import { SkeletonDetail } from '@/shared/components/feedback/Skeleton';
import { ErrorCard } from '@/shared/components/feedback/ErrorCard';
import { EmptyState } from '@/shared/components/feedback/EmptyState';
import { StatusBadge } from '@/shared/components/ui/StatusBadge';
import { formatDateTime } from '@/shared/utils/formatDate';
import { routes } from '@/constants/routes';
import type { OrderStatus } from '@/shared/types/enums';
import { useOrder } from '../hooks/useOrder';
import { OrderStatusStepper } from '../components/OrderStatusStepper';
import { OrderActionPanel } from '../components/OrderActionPanel';
import { OrderAddressCard } from '../components/OrderAddressCard';
import { OrderItemsTable } from '../components/OrderItemsTable';
import { OrderPaymentSummary } from '../components/OrderPaymentSummary';

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const orderId = Number(id);

  const { data: order, isLoading, isError, refetch } = useOrder(orderId);

  return (
    <AdminLayout>
      <div className="p-6">
        {isLoading ? (
          <SkeletonDetail />
        ) : isError ? (
          <ErrorCard onRetry={() => void refetch()} />
        ) : !order ? (
          <EmptyState
            icon={<ShoppingBag className="h-10 w-10" />}
            title="Order not found"
            message="The order you're looking for doesn't exist or has been removed."
            action={{ label: 'Back to Orders', onClick: () => navigate(routes.orders.list) }}
          />
        ) : (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => navigate(routes.orders.list)}
                aria-label="Back to orders"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <PageHeader
                title={`Order #${order.orderCode}`}
                description={`Placed ${formatDateTime(order.createdAt)}`}
                actions={
                  <StatusBadge type="order" status={order.status as OrderStatus} />
                }
              />
            </div>

            <div className="rounded-lg border border-gray-200 bg-white px-6 py-5">
              <OrderStatusStepper status={order.status as OrderStatus} />
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <OrderItemsTable
                  items={order.items}
                  subtotal={order.subTotal}
                  discountAmount={order.discountAmount}
                  shippingFee={order.shippingFee}
                  total={order.totalAmount}
                  voucherCode={order.voucherCode}
                />

                {order.customerNote && (
                  <div className="mt-4 rounded-lg border border-gray-200 bg-white p-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                      Customer Note
                    </p>
                    <p className="mt-1.5 text-sm text-gray-700">{order.customerNote}</p>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <OrderActionPanel order={order} refetch={refetch} />
                <OrderAddressCard
                  receiverName={order.receiverName}
                  receiverPhone={order.receiverPhone}
                  shippingStreet={order.shippingStreet}
                  shippingWard={order.shippingWard}
                  shippingDistrict={order.shippingDistrict}
                  shippingCity={order.shippingCity}
                  shippingPostalCode={order.shippingPostalCode}
                />
                <OrderPaymentSummary
                  paymentMethod={order.paymentMethod}
                  paymentStatus={order.paymentStatus}
                  totalAmount={order.totalAmount}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
