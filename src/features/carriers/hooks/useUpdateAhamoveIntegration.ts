import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/constants/queryKeys';
import { carrierService } from '../services/carrierService';
import type { UpdateAhamoveIntegrationRequest } from '../types/carrier.types';

export function useUpdateAhamoveIntegration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateAhamoveIntegrationRequest }) =>
      carrierService.updateAhamoveIntegration(id, body),
    onSuccess: (integration) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.carriers.lists() });
      void queryClient.invalidateQueries({ queryKey: queryKeys.carriers.detail(integration.carrierId) });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.carriers.ahamoveIntegration(integration.carrierId),
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.carriers.ahamoveWebhookSetup(integration.carrierId),
      });
      void queryClient.invalidateQueries({ queryKey: queryKeys.carriers.activeOptions() });
    },
  });
}
