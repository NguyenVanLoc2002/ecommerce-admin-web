import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/constants/queryKeys';
import { shipmentService } from '../services/shipmentService';

export function useCreateShipment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: shipmentService.create,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.shipments.lists() });
      // Creating a shipment auto-advances the linked order to SHIPPED.
      void queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
    },
  });
}
