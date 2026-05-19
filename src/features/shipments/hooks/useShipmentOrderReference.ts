import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/constants/queryKeys';
import { shipmentService } from '../services/shipmentService';

export function useShipmentOrderReference(orderId?: string) {
  return useQuery({
    queryKey: queryKeys.shipments.orderReference(orderId ?? ''),
    queryFn: () => shipmentService.getOrderReference(orderId ?? ''),
    staleTime: 60_000,
    enabled: Boolean(orderId),
  });
}
