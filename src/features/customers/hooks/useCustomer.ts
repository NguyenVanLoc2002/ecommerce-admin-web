import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/constants/queryKeys';
import { customerService } from '../services/customerService';

export function useCustomer(id?: string) {
  return useQuery({
    queryKey: queryKeys.customers.detail(id ?? ''),
    queryFn: () => customerService.getById(id ?? ''),
    staleTime: 60_000,
    enabled: Boolean(id),
  });
}
