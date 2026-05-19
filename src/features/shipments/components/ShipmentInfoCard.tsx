import { Truck, Hash, Calendar, Clock, CheckCircle2, ExternalLink } from 'lucide-react';
import { Badge } from '@/shared/components/ui/Badge';
import { formatDate, formatDateTime } from '@/shared/utils/formatDate';
import { formatEnumLabel } from '@/shared/utils/formatEnumLabel';
import { formatMoney } from '@/shared/utils/formatMoney';
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
        {shipment.carrierId && (
          <Row icon={<Hash className="h-4 w-4 text-gray-400" />} label="Carrier ID">
            <span className="font-mono text-xs text-gray-600">{shipment.carrierId}</span>
          </Row>
        )}

        {shipment.carrier && (
          <Row icon={<Truck className="h-4 w-4 text-gray-400" />} label="Carrier">
            <div className="space-y-1 text-right">
              <span className="text-sm font-medium text-gray-800">{shipment.carrier}</span>
              {(shipment.carrierCode || shipment.carrierProviderType) && (
                <div className="flex flex-wrap justify-end gap-1">
                  {shipment.carrierCode && <Badge variant="default">{shipment.carrierCode}</Badge>}
                  {shipment.carrierProviderType && (
                    <Badge variant="info">{formatEnumLabel(shipment.carrierProviderType)}</Badge>
                  )}
                </div>
              )}
            </div>
          </Row>
        )}

        {shipment.trackingNumber && (
          <Row icon={<Hash className="h-4 w-4 text-gray-400" />} label="Tracking Code">
            <span className="font-mono text-sm text-primary-600">{shipment.trackingNumber}</span>
          </Row>
        )}

        {shipment.carrierShipmentId && (
          <Row icon={<Hash className="h-4 w-4 text-gray-400" />} label="Carrier Shipment ID">
            <span className="font-mono text-sm text-gray-700">{shipment.carrierShipmentId}</span>
          </Row>
        )}

        {shipment.providerStatus && (
          <Row icon={<Truck className="h-4 w-4 text-gray-400" />} label="Provider Status">
            <Badge variant="info">{shipment.providerStatus}</Badge>
          </Row>
        )}

        {shipment.providerTrackingUrl && (
          <Row icon={<ExternalLink className="h-4 w-4 text-gray-400" />} label="Tracking URL">
            <a
              href={shipment.providerTrackingUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 hover:underline"
            >
              Open tracking
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </Row>
        )}

        {shipment.estimatedDeliveryDate && (
          <Row icon={<Calendar className="h-4 w-4 text-gray-400" />} label="Est. Delivery">
            <span className="text-sm text-gray-700">{formatDate(shipment.estimatedDeliveryDate)}</span>
          </Row>
        )}

        {shipment.shippingFee !== null && (
          <Row icon={<Hash className="h-4 w-4 text-gray-400" />} label="Shipping Fee">
            <span className="text-sm text-gray-700">{formatMoney(shipment.shippingFee)}</span>
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

        {shipment.note && (
          <div className="pt-1 border-t border-gray-100">
            <p className="text-xs text-gray-400 mb-1">Notes</p>
            <p className="text-sm text-gray-600">{shipment.note}</p>
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
