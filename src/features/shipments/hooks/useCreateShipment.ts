import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/constants/queryKeys';
import { AppError } from '@/shared/types/api.types';
import { isConcurrencyErrorCode } from '@/shared/utils/adminPhase3Errors';
import { shipmentService } from '../services/shipmentService';

export function useCreateShipment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: shipmentService.create,
    onSuccess: (shipment, variables) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.shipments.detail(shipment.id) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.shipments.lists() });
      void queryClient.invalidateQueries({ queryKey: queryKeys.shipments.byOrder(variables.orderId) });
      // Creating a shipment auto-advances the linked order to SHIPPED.
      void queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.orders.detail(variables.orderId) });
    },
    onError: (error, variables) => {
      if (!(error instanceof AppError)) {
        return;
      }

      if (error.code === 'SHIPMENT_ALREADY_EXISTS' || isConcurrencyErrorCode(error.code)) {
        void queryClient.invalidateQueries({ queryKey: queryKeys.shipments.all });
        void queryClient.invalidateQueries({ queryKey: queryKeys.shipments.byOrder(variables.orderId) });
        void queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
        void queryClient.invalidateQueries({ queryKey: queryKeys.orders.detail(variables.orderId) });
      }
    },
  });
}
