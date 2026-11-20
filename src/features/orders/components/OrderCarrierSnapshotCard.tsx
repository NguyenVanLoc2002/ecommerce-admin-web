import { Truck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/shared/components/ui/Button';
import { Badge } from '@/shared/components/ui/Badge';
import { formatMoney } from '@/shared/utils/formatMoney';
import { formatEnumLabel } from '@/shared/utils/formatEnumLabel';
import { getOrderShipmentEligibilityMessage } from '@/shared/utils/orderShipmentEligibility';
import { routes } from '@/constants/routes';
import type { Order } from '../types/order.types';

interface OrderCarrierSnapshotCardProps {
  order: Order;
  onCreateShipment: () => void;
}

export function OrderCarrierSnapshotCard({
  order,
  onCreateShipment,
}: OrderCarrierSnapshotCardProps) {
  const hasSnapshot = Boolean(order.carrierId || order.carrierName);
  const eligibilityMessage = getOrderShipmentEligibilityMessage(order);

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Truck className="h-4 w-4 text-gray-400" />
        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
          Checkout Carrier
        </p>
      </div>

      {hasSnapshot ? (
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-gray-900">
              {order.carrierName ?? 'Selected at checkout'}
            </span>
            {order.carrierCode && <Badge variant="default">{order.carrierCode}</Badge>}
            {order.carrierProviderType && (
              <Badge variant="info">{formatEnumLabel(order.carrierProviderType)}</Badge>
            )}
          </div>
          <div className="space-y-1 text-sm text-gray-600">
            {order.carrierId && (
              <p>
                Carrier ID: <span className="font-mono text-xs">{order.carrierId}</span>
              </p>
            )}
            <p>Shipping fee: {formatMoney(order.shippingFee)}</p>
          </div>
          <p className="text-xs text-gray-500">
            You can create a shipment without choosing another carrier and let the backend reuse this snapshot.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-sm text-gray-600">
            No checkout carrier snapshot is stored on this order.
          </p>
          <p className="text-xs text-gray-500">
            Shipment creation is still available, but staff must choose a configured carrier or enter a manual carrier name.
          </p>
        </div>
      )}

      <Button className="w-full" onClick={onCreateShipment} disabled={Boolean(eligibilityMessage)}>
        {hasSnapshot ? 'Create shipment with checkout carrier' : 'Create shipment'}
      </Button>
      {eligibilityMessage && <p className="text-xs text-warning-700" role="status">{eligibilityMessage}</p>}
      <Link
        className="block text-center text-xs font-medium text-primary-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
        to={`${routes.shipments.list}?orderId=${encodeURIComponent(String(order.id))}`}
      >
        View shipment operations
      </Link>
    </div>
  );
}
