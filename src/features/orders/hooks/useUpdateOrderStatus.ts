import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/constants/queryKeys';
import { AppError } from '@/shared/types/api.types';
import { isConcurrencyErrorCode } from '@/shared/utils/adminPhase3Errors';
import { orderService } from '../services/orderService';
import type { CancellationOperation } from '../services/orderService';
import type { OrderAction } from '../types/order.types';

export function useOrderAction(orderId: string) {
  const queryClient = useQueryClient();

  return useMutation<Awaited<ReturnType<typeof orderService.confirm>> | CancellationOperation, Error, {
    action: OrderAction;
    reason?: string;
  }>({
    mutationFn: (request: { action: OrderAction; reason?: string }) =>
      request.action === 'cancel'
        ? orderService.cancel(orderId, { reason: request.reason ?? '' })
        : orderService[request.action](orderId),
    onSuccess: (_result, request) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.orders.detail(orderId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.orders.lists() });
      if (request.action === 'cancel') {
        void queryClient.invalidateQueries({ queryKey: ['orders', orderId, 'cancellation'] });
      }
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
