import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/constants/queryKeys';
import { carrierService } from '../services/carrierService';
import type { TestAhamoveConnectionRequest } from '../types/carrier.types';

export function useTestAhamoveConnection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: TestAhamoveConnectionRequest }) =>
      carrierService.testAhamoveConnection(id, body),
    onSettled: (_result, _error, variables) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.carriers.lists() });
      void queryClient.invalidateQueries({ queryKey: queryKeys.carriers.detail(variables.id) });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.carriers.ahamoveIntegration(variables.id),
      });
    },
  });
}
