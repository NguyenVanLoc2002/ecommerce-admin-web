import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/constants/queryKeys';
import { carrierService } from '../services/carrierService';

export function useAhamoveIntegration(id?: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.carriers.ahamoveIntegration(id ?? ''),
    queryFn: () => carrierService.getAhamoveIntegration(id ?? ''),
    enabled: enabled && Boolean(id),
    staleTime: 30_000,
  });
}
