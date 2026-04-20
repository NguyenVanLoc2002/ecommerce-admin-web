import { MapPin, Phone } from 'lucide-react';

interface OrderAddressCardProps {
  receiverName: string;
  receiverPhone: string;
  shippingStreet: string;
  shippingWard: string;
  shippingDistrict: string;
  shippingCity: string;
  shippingPostalCode: string | null;
}

export function OrderAddressCard({
  receiverName,
  receiverPhone,
  shippingStreet,
  shippingWard,
  shippingDistrict,
  shippingCity,
  shippingPostalCode,
}: OrderAddressCardProps) {
  const fullAddress = [shippingStreet, shippingWard, shippingDistrict, shippingCity, shippingPostalCode]
    .filter(Boolean)
    .join(', ');

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 space-y-3">
      <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
        Shipping Address
      </p>

      <div className="space-y-2">
        <p className="text-sm font-medium text-gray-900">{receiverName}</p>

        <div className="flex items-center gap-2">
          <Phone className="h-4 w-4 shrink-0 text-gray-400" />
          <p className="text-sm text-gray-700">{receiverPhone}</p>
        </div>

        <div className="flex items-start gap-2">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
          <p className="text-sm text-gray-700">{fullAddress}</p>
        </div>
      </div>
    </div>
  );
}
