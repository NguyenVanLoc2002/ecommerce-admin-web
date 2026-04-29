import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/constants/queryKeys';
import { orderService } from '../services/orderService';

export function useOrder(id?: string) {
  return useQuery({
    queryKey: queryKeys.orders.detail(id ?? ''),
    queryFn: () => orderService.getById(id ?? ''),
    staleTime: 60_000,
    enabled: Boolean(id),
  });
}
