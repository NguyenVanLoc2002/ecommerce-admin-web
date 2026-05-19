import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/constants/queryKeys';
import { carrierService } from '../services/carrierService';

export function useGenerateAhamoveWebhookToken() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => carrierService.generateAhamoveWebhookToken(id),
    onSuccess: (_result, id) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.carriers.lists() });
      void queryClient.invalidateQueries({ queryKey: queryKeys.carriers.detail(id) });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.carriers.ahamoveIntegration(id),
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.carriers.ahamoveWebhookSetup(id),
      });
    },
  });
}
