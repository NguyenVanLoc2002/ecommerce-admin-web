import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/constants/queryKeys';
import type { EntityId } from '@/shared/types/api.types';
import { warehouseService } from '../services/warehouseService';

export function useDeleteWarehouse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: EntityId) => warehouseService.remove(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.warehouses.lists() });
    },
  });
}
