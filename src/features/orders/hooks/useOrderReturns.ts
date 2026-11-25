import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/constants/queryKeys';
import { listOrderReturns } from '../services/orderReturnService';

export function useOrderReturns(params: Parameters<typeof listOrderReturns>[0]) {
  return useQuery({
    queryKey: queryKeys.orders.returns(params),
    queryFn: () => listOrderReturns(params),
  });
}
