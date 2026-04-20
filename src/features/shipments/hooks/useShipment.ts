import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/constants/queryKeys';
import { shipmentService } from '../services/shipmentService';

export function useShipment(id: number) {
  return useQuery({
    queryKey: queryKeys.shipments.detail(id),
    queryFn: () => shipmentService.getById(id),
    staleTime: 60_000,
    enabled: id > 0,
  });
}
