import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ShoppingBag, Copy, Check } from 'lucide-react';
import { AdminLayout } from '@/shared/components/layout/AdminLayout';
import { PageHeader } from '@/shared/components/layout/PageHeader';
import { useBreadcrumbLabel } from '@/shared/components/layout';
import { Button } from '@/shared/components/ui/Button';
import { SkeletonDetail } from '@/shared/components/feedback/Skeleton';
import { ErrorCard } from '@/shared/components/feedback/ErrorCard';
import { EmptyState } from '@/shared/components/feedback/EmptyState';
import { StatusBadge } from '@/shared/components/ui/StatusBadge';
import { formatMoney } from '@/shared/utils/formatMoney';
import { formatDateTime } from '@/shared/utils/formatDate';
import { routes } from '@/constants/routes';
import { usePermission } from '@/constants/permissions';
import { OrderReturns } from '../components/OrderReturns';
import { useOrder } from '../hooks/useOrder';
import { OrderCarrierSnapshotCard } from '../components/OrderCarrierSnapshotCard';
import { OrderStatusStepper } from '../components/OrderStatusStepper';
import { OrderActionPanel } from '../components/OrderActionPanel';
import { OrderAddressCard } from '../components/OrderAddressCard';
import { OrderItemsTable } from '../components/OrderItemsTable';
import { OrderPaymentSummary } from '../components/OrderPaymentSummary';
import { OrderTaxSnapshots } from '@/features/tax/OrderTaxSnapshots';
import { OrderShipmentPanel } from '@/features/shipments';
import { useOrders } from '../hooks/useOrders';

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const orderId = id ?? '';
  const canViewReturns = usePermission('orders', 'returns');
  const canViewTax = usePermission('taxSnapshots', 'read');
  const [returnPage, setReturnPage] = useState(0);
  const [copied, setCopied] = useState(false);

  const { data: order, isLoading, isError, refetch } = useOrder(orderId);
  const {
    data: summaries,
    isLoading: attentionLoading,
    isError: attentionError,
    refetch: refetchAttention,
  } = useOrders({
    page: 0,
    size: 20,
    sort: 'createdAt,desc',
    keyword: order?.orderCode,
  }, Boolean(order?.orderCode));
  const orderSummary = summaries?.items.find((item) => item.id === orderId);

  useBreadcrumbLabel(
    routes.orders.detail(orderId),
    isLoading ? 'Loading...' : (order?.orderCode ?? (isError ? 'Loading...' : 'Not found')),
  );

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
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      aria-label={copied ? 'Copied' : 'Copy order code'}
                      onClick={() => {
                        void navigator.clipboard.writeText(order.orderCode).then(() => {
                          setCopied(true);
                          setTimeout(() => setCopied(false), 1500);
                        });
                      }}
                      className="inline-flex h-7 w-7 items-center justify-center rounded text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                    >
                      {copied ? (
                        <Check className="h-3.5 w-3.5 text-success-600" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>
                    <StatusBadge type="order" status={order.status} />
                  </div>
                }
              />
            </div>

            <div className="rounded-lg border border-gray-200 bg-white px-6 py-5">
              <OrderStatusStepper status={order.status} />
            </div>

            {(attentionLoading || attentionError || orderSummary?.attention) && (
              <section
                className={`rounded-lg border px-4 py-3 ${attentionError ? 'border-danger-200 bg-danger-50' : 'border-warning-200 bg-warning-50'}`}
                aria-label="Order attention"
                role={attentionError ? 'alert' : 'status'}
              >
                <p className={`text-xs font-semibold uppercase tracking-wide ${attentionError ? 'text-danger-800' : 'text-warning-800'}`}>
                  {attentionLoading
                    ? 'Checking order attention'
                    : attentionError
                      ? 'Order attention unavailable'
                      : orderSummary?.attention?.replace(/_/g, ' ')}
                </p>
                {orderSummary?.attentionReason && (
                  <p className={`mt-1 text-sm ${attentionError ? 'text-danger-900' : 'text-warning-900'}`}>
                    {orderSummary.attentionReason}
                  </p>
                )}
                {attentionError && (
                  <Button className="mt-2" size="sm" variant="secondary" onClick={() => void refetchAttention()}>
                    Retry attention check
                  </Button>
                )}
              </section>
            )}

            <section className="rounded-lg border border-gray-200 bg-white px-6 py-4" aria-label="Customer identity">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Customer at checkout</p>
              {order.customerSnapshotAvailable ? (
                <div className="mt-1">
                  <p className="text-sm font-medium text-gray-900">{order.customerNameSnapshot ?? 'Name unavailable'}</p>
                  {order.customerEmailSnapshot && <p className="text-sm text-gray-600">{order.customerEmailSnapshot}</p>}
                </div>
              ) : (
                <p className="mt-1 text-sm text-gray-600">Historical customer snapshot unavailable</p>
              )}
              {order.currentCustomerProfileAvailable ? (
                <button
                  type="button"
                  className="mt-2 block text-xs text-primary-700 hover:underline"
                  onClick={() => navigate(routes.customers.list, { state: { openCustomerId: order.customerId } })}
                >
                  Current profile: {order.currentCustomerName ?? order.currentCustomerEmail ?? order.customerId}
                </button>
              ) : (
                <p className="mt-2 text-xs text-gray-500">Customer profile deleted or unavailable</p>
              )}
            </section>

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
                <OrderActionPanel order={order} refetch={() => { void refetch(); }} />
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
                  orderCode={order.orderCode}
                />
                {order.freeShippingSnapshot ? (
                  <section className="rounded-lg border border-gray-200 bg-white p-4">
                    <h2 className="text-sm font-semibold text-gray-900">Miễn phí vận chuyển</h2>
                    <dl className="mt-3 space-y-2 text-sm">
                      <div className="flex justify-between gap-2">
                        <dt className="text-gray-500">Phí hãng báo tại checkout</dt>
                        <dd>{formatMoney(order.freeShippingSnapshot.quotedFee)}</dd>
                      </div>
                      <div className="flex justify-between gap-2">
                        <dt className="text-gray-500">Phí thu khách</dt>
                        <dd>{formatMoney(order.shippingFee)}</dd>
                      </div>
                      <div className="flex justify-between gap-2">
                        <dt className="text-gray-500">Tiền hàng đủ điều kiện</dt>
                        <dd>{formatMoney(order.freeShippingSnapshot.eligibleAmount)}</dd>
                      </div>
                      <div className="flex justify-between gap-2">
                        <dt className="text-gray-500">Ngưỡng tại phiên bản {order.freeShippingSnapshot.policyRevision}</dt>
                        <dd>{formatMoney(order.freeShippingSnapshot.threshold)}</dd>
                      </div>
                    </dl>
                  </section>
                ) : null}
                {canViewTax ? <OrderTaxSnapshots orderId={order.id} /> : null}
                <OrderCarrierSnapshotCard
                  order={order}
                  onCreateShipment={() => navigate(routes.shipments.createForOrder(order.id))}
                />
              </div>
            </div>
            <OrderShipmentPanel orderId={order.id} shippingFee={order.shippingFee} />
            {canViewReturns && (
              <section className="rounded-lg border border-gray-200 bg-white p-5" aria-labelledby="order-returns-title">
                <h2 id="order-returns-title" className="text-sm font-semibold">Return requests</h2>
                <OrderReturns orderId={order.id} page={returnPage} onPageChange={setReturnPage} />
              </section>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
