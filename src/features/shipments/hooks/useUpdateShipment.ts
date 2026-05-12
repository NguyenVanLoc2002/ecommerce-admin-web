import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/constants/queryKeys';
import { AppError } from '@/shared/types/api.types';
import { isConcurrencyErrorCode } from '@/shared/utils/adminPhase3Errors';
import { shipmentService } from '../services/shipmentService';
import type { UpdateShipmentRequest } from '../types/shipment.types';

export function useUpdateShipment(shipmentId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: UpdateShipmentRequest) =>
      shipmentService.update(shipmentId, body),
    onSuccess: (shipment) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.shipments.detail(shipmentId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.shipments.lists() });
      void queryClient.invalidateQueries({ queryKey: queryKeys.orders.detail(shipment.orderId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.orders.lists() });
    },
    onError: (error) => {
      if (!(error instanceof AppError) || !isConcurrencyErrorCode(error.code)) {
        return;
      }

      void queryClient.invalidateQueries({ queryKey: queryKeys.shipments.detail(shipmentId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.shipments.lists() });
    },
  });
}
