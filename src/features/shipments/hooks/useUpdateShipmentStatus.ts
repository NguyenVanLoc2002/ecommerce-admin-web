import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/constants/queryKeys';
import { shipmentService } from '../services/shipmentService';
import type { UpdateShipmentStatusRequest } from '../types/shipment.types';

export function useUpdateShipmentStatus(shipmentId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: UpdateShipmentStatusRequest) =>
      shipmentService.updateStatus(shipmentId, body),
    onSuccess: (updatedShipment) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.shipments.detail(shipmentId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.shipments.lists() });
      void queryClient.invalidateQueries({ queryKey: queryKeys.shipments.events(shipmentId) });

      // When shipment is DELIVERED, the linked order is automatically advanced.
      if (updatedShipment.status === 'DELIVERED') {
        void queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
      }
    },
  });
}
