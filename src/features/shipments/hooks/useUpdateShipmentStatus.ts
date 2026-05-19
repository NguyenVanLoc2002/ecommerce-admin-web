import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/constants/queryKeys';
import { AppError } from '@/shared/types/api.types';
import { isConcurrencyErrorCode } from '@/shared/utils/adminPhase3Errors';
import { shipmentService } from '../services/shipmentService';
import type { UpdateShipmentStatusRequest } from '../types/shipment.types';

export function useUpdateShipmentStatus(shipmentId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: UpdateShipmentStatusRequest) =>
      shipmentService.updateStatus(shipmentId, body),
    onSuccess: (updatedShipment) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.shipments.detail(shipmentId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.shipments.lists() });
      void queryClient.invalidateQueries({ queryKey: queryKeys.shipments.byOrder(updatedShipment.orderId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.orders.detail(updatedShipment.orderId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.orders.lists() });

      // When shipment is DELIVERED, the linked order is automatically advanced.
      if (updatedShipment.status === 'DELIVERED') {
        void queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
      }
    },
    onError: (error) => {
      if (!(error instanceof AppError)) {
        return;
      }

      if (error.code === 'ORDER_STATUS_INVALID' || isConcurrencyErrorCode(error.code)) {
        void queryClient.invalidateQueries({ queryKey: queryKeys.shipments.detail(shipmentId) });
        void queryClient.invalidateQueries({ queryKey: queryKeys.shipments.lists() });
        void queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
      }
    },
  });
}
