import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/constants/queryKeys';
import { inventoryService } from '../services/inventoryService';

export function useAdjustStock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: inventoryService.adjustStock,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.inventory.all });
    },
  });
}
