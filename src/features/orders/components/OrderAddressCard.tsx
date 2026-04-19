import { MapPin, User, Phone } from 'lucide-react';
import type { OrderAddress, OrderCustomer } from '../types/order.types';

interface OrderAddressCardProps {
  address: OrderAddress;
  customer: OrderCustomer;
}

export function OrderAddressCard({ address, customer }: OrderAddressCardProps) {
  const fullAddress = [address.street, address.ward, address.district, address.province]
    .filter(Boolean)
    .join(', ');

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 space-y-3">
      <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
        Shipping Address
      </p>

      <div className="space-y-2">
        <div className="flex items-start gap-2">
          <User className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
          <div>
            <p className="text-sm font-medium text-gray-900">{address.fullName}</p>
            <p className="text-xs text-gray-500">{customer.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Phone className="h-4 w-4 shrink-0 text-gray-400" />
          <p className="text-sm text-gray-700">{address.phone}</p>
        </div>

        <div className="flex items-start gap-2">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
          <p className="text-sm text-gray-700">{fullAddress}</p>
        </div>
      </div>
    </div>
  );
}
