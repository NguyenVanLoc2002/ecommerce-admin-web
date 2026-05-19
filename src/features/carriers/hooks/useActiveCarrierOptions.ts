import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/constants/queryKeys';
import { carrierService } from '../services/carrierService';

export function useActiveCarrierOptions() {
  return useQuery({
    queryKey: queryKeys.carriers.activeOptions(),
    queryFn: () => carrierService.getActiveOptions(),
    staleTime: 30_000,
  });
}
