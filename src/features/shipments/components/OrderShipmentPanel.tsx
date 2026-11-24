import { Link } from 'react-router-dom';
import { routes } from '@/constants/routes';
import { EmptyState } from '@/shared/components/feedback/EmptyState';
import { ErrorCard } from '@/shared/components/feedback/ErrorCard';
import { SkeletonTimeline } from '@/shared/components/feedback/Skeleton';
import { StatusBadge } from '@/shared/components/ui/StatusBadge';
import { formatMoney } from '@/shared/utils/formatMoney';
import { useShipmentByOrder } from '../hooks/useShipmentByOrder';
import { ShipmentEventTimeline } from './ShipmentEventTimeline';

export function OrderShipmentPanel({ orderId, shippingFee }: { orderId: string; shippingFee: number }) {
  const { data: shipment, isLoading, isError, refetch } = useShipmentByOrder(orderId);

  if (isLoading) return <SkeletonTimeline items={3} />;
  if (isError) return <ErrorCard onRetry={() => void refetch()} />;
  if (!shipment) {
    return (
      <EmptyState
        title="No shipment yet"
        message="Shipment events will appear here after a shipment is created."
        className="rounded-lg border border-gray-200 bg-white p-6"
      />
    );
  }

  return (
    <section className="rounded-lg border border-gray-200 bg-white p-5" aria-labelledby="order-shipment-title">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="order-shipment-title" className="text-sm font-semibold text-gray-900">Shipment progress</h2>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <StatusBadge type="shipment" status={shipment.status} />
            <span className="text-sm text-gray-700">{shipment.carrier ?? 'Carrier unavailable'}</span>
            {shipment.trackingNumber && <span className="font-mono text-xs text-gray-500">{shipment.trackingNumber}</span>}
          </div>
        </div>
        <Link
          className="text-xs font-medium text-primary-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
          to={routes.shipments.detail(shipment.id)}
        >
          {shipment.status === 'FAILED' || shipment.status === 'RETURNED'
            ? 'Review shipment exception'
            : 'Open shipment details'}
        </Link>
      </div>

      {shipment.bookingStatus === 'UNKNOWN' || shipment.bookingStatus === 'PENDING' ? (
        <p className="mt-3 rounded-md border border-warning-200 bg-warning-50 px-3 py-2 text-xs text-warning-800" role="status">
          Carrier booking is {shipment.bookingStatus.toLowerCase()}. Reconcile this shipment before attempting another booking.
        </p>
      ) : null}

      {shipment.status === 'FAILED' || shipment.status === 'RETURNED' ? (
        <p className="mt-3 rounded-md border border-warning-200 bg-warning-50 px-3 py-2 text-xs text-warning-800" role="status">
          {shipment.status === 'FAILED'
            ? 'Delivery failed. Review shipment events and check the carrier outcome.'
            : 'The carrier shipment was returned. Review shipment events for the return details.'}
        </p>
      ) : null}

      <dl className="mt-4 grid grid-cols-1 gap-2 border-y border-gray-100 py-3 text-sm sm:grid-cols-2">
        <div className="flex justify-between gap-3">
          <dt className="text-gray-500">Checkout shipping fee</dt>
          <dd className="font-medium text-gray-800">{formatMoney(shippingFee)}</dd>
        </div>
        {shipment.estimatedCarrierCost !== null && (
          <div className="flex justify-between gap-3">
            <dt className="text-gray-500">Estimated carrier cost</dt>
            <dd className="font-medium text-gray-800">{formatMoney(shipment.estimatedCarrierCost)}</dd>
          </div>
        )}
        {shipment.carrierCost !== null && (
          <div className="flex justify-between gap-3">
            <dt className="text-gray-500">Actual carrier cost</dt>
            <dd className="font-medium text-gray-800">{formatMoney(shipment.carrierCost)}</dd>
          </div>
        )}
      </dl>

      <div className="mt-4">
        <ShipmentEventTimeline events={shipment.events} isLoading={false} isError={false} onRetry={() => {}} />
      </div>
    </section>
  );
}
