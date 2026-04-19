import { useNavigate } from 'react-router-dom';
import { Eye } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { routes } from '@/constants/routes';
import type { ShipmentSummary } from '../types/shipment.types';

interface ShipmentRowActionsProps {
  shipment: ShipmentSummary;
}

export function ShipmentRowActions({ shipment }: ShipmentRowActionsProps) {
  const navigate = useNavigate();

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      onClick={() => navigate(routes.shipments.detail(shipment.id))}
      aria-label="View shipment"
    >
      <Eye className="h-4 w-4" />
    </Button>
  );
}
