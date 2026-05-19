import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/constants/queryKeys';
import { carrierService } from '../services/carrierService';

export function useCreateCarrier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: carrierService.create,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.carriers.lists() });
      void queryClient.invalidateQueries({ queryKey: queryKeys.carriers.activeOptions() });
    },
  });
}
