import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/constants/queryKeys';
import { shipmentService } from '../services/shipmentService';

export function useShipment(id?: string) {
  return useQuery({
    queryKey: queryKeys.shipments.detail(id ?? ''),
    queryFn: () => shipmentService.getById(id ?? ''),
    staleTime: 60_000,
    enabled: Boolean(id),
  });
}
