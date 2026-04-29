import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/constants/queryKeys';
import { shipmentService } from '../services/shipmentService';
import type { UpdateShipmentRequest } from '../types/shipment.types';

export function useUpdateShipment(shipmentId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: UpdateShipmentRequest) =>
      shipmentService.update(shipmentId, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.shipments.detail(shipmentId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.shipments.lists() });
    },
  });
}
