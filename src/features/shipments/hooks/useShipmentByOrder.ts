import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/constants/queryKeys';
import { AppError } from '@/shared/types/api.types';
import { shipmentService } from '../services/shipmentService';

export function useShipmentByOrder(orderId?: string) {
  return useQuery({
    queryKey: queryKeys.shipments.byOrder(orderId ?? ''),
    queryFn: async () => {
      try {
        return await shipmentService.getByOrderId(orderId ?? '');
      } catch (error) {
        if (error instanceof AppError && error.code === 'SHIPMENT_NOT_FOUND') {
          return null;
        }

        throw error;
      }
    },
    staleTime: 30_000,
    enabled: Boolean(orderId),
  });
}

