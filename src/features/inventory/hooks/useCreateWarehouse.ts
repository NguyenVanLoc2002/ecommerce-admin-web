import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/constants/queryKeys';
import { warehouseService } from '../services/warehouseService';

export function useCreateWarehouse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: warehouseService.create,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.warehouses.lists() });
    },
  });
}
