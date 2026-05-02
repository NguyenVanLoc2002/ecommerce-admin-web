import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/constants/queryKeys';
import { customerService } from '../services/customerService';
import type { AdminCustomerFilter } from '../types/customer.types';

export function useCustomers(params: AdminCustomerFilter) {
  return useQuery({
    queryKey: queryKeys.customers.list(params),
    queryFn: () => customerService.getList(params),
    staleTime: 30_000,
  });
}
