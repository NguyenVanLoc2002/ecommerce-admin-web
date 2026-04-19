import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/constants/queryKeys';
import { shipmentService } from '../services/shipmentService';
import type { ShipmentListParams } from '../types/shipment.types';

export function useShipments(params: ShipmentListParams) {
  return useQuery({
    queryKey: queryKeys.shipments.list(params),
    queryFn: () => shipmentService.getList(params),
    staleTime: 30_000,
  });
}
