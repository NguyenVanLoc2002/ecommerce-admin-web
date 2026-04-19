import { useNavigate } from 'react-router-dom';
import { ShoppingBag, User, Phone, MapPin } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { routes } from '@/constants/routes';
import type { Shipment } from '../types/shipment.types';

interface ShipmentOrderCardProps {
  shipment: Shipment;
}

export function ShipmentOrderCard({ shipment }: ShipmentOrderCardProps) {
  const navigate = useNavigate();
  const { shippingAddress: addr } = shipment;
  const fullAddress = [addr.street, addr.ward, addr.district, addr.province]
    .filter(Boolean)
    .join(', ');

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShoppingBag className="h-4 w-4 text-gray-400" />
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Order</p>
        </div>
        <Button
          variant="link"
          size="sm"
          onClick={() => navigate(routes.orders.detail(shipment.orderId))}
          className="text-xs"
        >
          #{shipment.orderCode}
        </Button>
      </div>

      <div className="space-y-2">
        <div className="flex items-start gap-2">
          <User className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
          <div>
            <p className="text-sm font-medium text-gray-900">{shipment.customer.fullName}</p>
            <p className="text-xs text-gray-500">{shipment.customer.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Phone className="h-4 w-4 shrink-0 text-gray-400" />
          <p className="text-sm text-gray-700">{shipment.customer.phone}</p>
        </div>

        <div className="flex items-start gap-2">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
          <p className="text-sm text-gray-700">{fullAddress}</p>
        </div>
      </div>
    </div>
  );
}
