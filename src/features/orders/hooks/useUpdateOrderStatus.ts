import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/constants/queryKeys';
import { AppError } from '@/shared/types/api.types';
import { isConcurrencyErrorCode } from '@/shared/utils/adminPhase3Errors';
import { orderService } from '../services/orderService';
import type { OrderAction } from '../types/order.types';

export function useOrderAction(orderId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (action: OrderAction) => orderService[action](orderId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.orders.detail(orderId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.orders.lists() });
    },
    onError: (error) => {
      if (!(error instanceof AppError)) {
        return;
      }

      if (error.code === 'ORDER_STATUS_INVALID' || isConcurrencyErrorCode(error.code)) {
        void queryClient.invalidateQueries({ queryKey: queryKeys.orders.detail(orderId) });
        void queryClient.invalidateQueries({ queryKey: queryKeys.orders.lists() });
      }
    },
  });
}
