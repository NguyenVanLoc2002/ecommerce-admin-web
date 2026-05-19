import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/constants/queryKeys';
import { carrierService } from '../services/carrierService';
import type { UpdateCarrierRequest } from '../types/carrier.types';

export function useUpdateCarrier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateCarrierRequest }) =>
      carrierService.update(id, body),
    onSuccess: (carrier) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.carriers.lists() });
      void queryClient.invalidateQueries({ queryKey: queryKeys.carriers.detail(carrier.id) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.carriers.activeOptions() });
    },
  });
}
