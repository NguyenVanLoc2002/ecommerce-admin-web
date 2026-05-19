import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/constants/queryKeys';
import { carrierService } from '../services/carrierService';

export function useCarrier(id?: string) {
  return useQuery({
    queryKey: queryKeys.carriers.detail(id ?? ''),
    queryFn: () => carrierService.getById(id ?? ''),
    enabled: Boolean(id),
    staleTime: 30_000,
  });
}
