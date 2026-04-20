import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/constants/queryKeys';
import { orderService } from '../services/orderService';
import type { OrderAction } from '../types/order.types';

export function useOrderAction(orderId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (action: OrderAction) => orderService[action](orderId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.orders.detail(orderId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.orders.lists() });
    },
  });
}
