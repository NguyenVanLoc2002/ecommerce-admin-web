import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/constants/queryKeys';
import { orderService } from '../services/orderService';
import type { OrderListParams } from '../types/order.types';

export function useOrders(params: OrderListParams) {
  return useQuery({
    queryKey: queryKeys.orders.list(params),
    queryFn: () => orderService.getList(params),
    staleTime: 30_000,
  });
}
