import { Truck, Hash, Calendar, Clock, CheckCircle2 } from 'lucide-react';
import { formatDate, formatDateTime } from '@/shared/utils/formatDate';
import type { Shipment } from '../types/shipment.types';

interface ShipmentInfoCardProps {
  shipment: Shipment;
}

export function ShipmentInfoCard({ shipment }: ShipmentInfoCardProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Truck className="h-4 w-4 text-gray-400" />
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
          Shipment Details
        </p>
      </div>

      <div className="space-y-2.5">
        {shipment.carrier && (
          <Row icon={<Truck className="h-4 w-4 text-gray-400" />} label="Carrier">
            <span className="text-sm font-medium text-gray-800">{shipment.carrier}</span>
          </Row>
        )}

        {shipment.trackingCode && (
          <Row icon={<Hash className="h-4 w-4 text-gray-400" />} label="Tracking Code">
            <span className="font-mono text-sm text-primary-600">{shipment.trackingCode}</span>
          </Row>
        )}

        {shipment.estimatedDelivery && (
          <Row icon={<Calendar className="h-4 w-4 text-gray-400" />} label="Est. Delivery">
            <span className="text-sm text-gray-700">{formatDate(shipment.estimatedDelivery)}</span>
          </Row>
        )}

        {shipment.shippedAt && (
          <Row icon={<Clock className="h-4 w-4 text-gray-400" />} label="Shipped At">
            <span className="text-sm text-gray-700">{formatDateTime(shipment.shippedAt)}</span>
          </Row>
        )}

        {shipment.deliveredAt && (
          <Row icon={<CheckCircle2 className="h-4 w-4 text-success-500" />} label="Delivered At">
            <span className="text-sm text-gray-700">{formatDateTime(shipment.deliveredAt)}</span>
          </Row>
        )}

        {shipment.notes && (
          <div className="pt-1 border-t border-gray-100">
            <p className="text-xs text-gray-400 mb-1">Notes</p>
            <p className="text-sm text-gray-600">{shipment.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function Row({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-2 shrink-0">
        {icon}
        <span className="text-sm text-gray-500">{label}</span>
      </div>
      <div className="text-right">{children}</div>
    </div>
  );
}
