import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/constants/queryKeys';
import { shipmentService } from '../services/shipmentService';
import type { CancelShipmentProviderRequest } from '../types/shipment.types';

export function useCancelShipmentProvider(shipmentId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CancelShipmentProviderRequest) =>
      shipmentService.cancelProvider(shipmentId, body),
    onSuccess: (shipment) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.shipments.detail(shipmentId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.shipments.byOrder(shipment.orderId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.shipments.lists() });
      void queryClient.invalidateQueries({ queryKey: queryKeys.orders.detail(shipment.orderId) });
    },
  });
}
