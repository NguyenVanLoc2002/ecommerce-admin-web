import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/constants/queryKeys';
import { customerService } from '../services/customerService';

export function useDeleteCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => customerService.remove(id),
    onSuccess: (_data, id) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.customers.lists() });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.customers.detail(id),
      });
    },
  });
}
