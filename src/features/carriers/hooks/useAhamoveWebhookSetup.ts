import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/constants/queryKeys';
import { carrierService } from '../services/carrierService';

export function useAhamoveWebhookSetup(id?: string, enabled = false) {
  return useQuery({
    queryKey: queryKeys.carriers.ahamoveWebhookSetup(id ?? ''),
    queryFn: () => carrierService.getAhamoveWebhookSetup(id ?? ''),
    enabled: enabled && Boolean(id),
    staleTime: 30_000,
  });
}
