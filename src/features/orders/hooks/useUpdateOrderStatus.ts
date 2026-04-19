import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/constants/queryKeys';
import { orderService } from '../services/orderService';
import type { UpdateOrderStatusRequest } from '../types/order.types';

export function useUpdateOrderStatus(orderId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: UpdateOrderStatusRequest) =>
      orderService.updateStatus(orderId, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.orders.detail(orderId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.orders.lists() });
    },
  });
}
