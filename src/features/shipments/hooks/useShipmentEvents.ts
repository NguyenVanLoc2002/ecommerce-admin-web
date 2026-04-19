import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/constants/queryKeys';
import { shipmentService } from '../services/shipmentService';

export function useShipmentEvents(shipmentId: number) {
  return useQuery({
    queryKey: queryKeys.shipments.events(shipmentId),
    queryFn: () => shipmentService.getEvents(shipmentId),
    staleTime: 30_000,
    enabled: shipmentId > 0,
  });
}
