import { Truck } from 'lucide-react';
import { StatusBadge } from '@/shared/components/ui/StatusBadge';
import { formatDateTime, formatDate } from '@/shared/utils/formatDate';
import type { OrderShipment } from '../types/order.types';

interface OrderShipmentSummaryProps {
  shipment: OrderShipment;
}

export function OrderShipmentSummary({ shipment }: OrderShipmentSummaryProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Truck className="h-4 w-4 text-gray-400" />
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Shipment</p>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">Status</span>
          <StatusBadge type="shipment" status={shipment.status} />
        </div>

        {shipment.carrier && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Carrier</span>
            <span className="text-sm font-medium text-gray-800">{shipment.carrier}</span>
          </div>
        )}

        {shipment.trackingCode && (
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm text-gray-500 shrink-0">Tracking</span>
            <span className="text-xs font-mono text-primary-600">{shipment.trackingCode}</span>
          </div>
        )}

        {shipment.shippedAt && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Shipped</span>
            <span className="text-xs text-gray-600">{formatDateTime(shipment.shippedAt)}</span>
          </div>
        )}

        {shipment.estimatedDelivery && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Est. delivery</span>
            <span className="text-xs text-gray-600">{formatDate(shipment.estimatedDelivery)}</span>
          </div>
        )}

        {shipment.deliveredAt && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Delivered</span>
            <span className="text-xs text-gray-600">{formatDateTime(shipment.deliveredAt)}</span>
          </div>
        )}
      </div>
    </div>
  );
}
