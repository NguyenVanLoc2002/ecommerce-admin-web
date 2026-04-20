import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/constants/queryKeys';
import { warehouseService } from '../services/warehouseService';
import type { UpdateWarehouseRequest } from '../types/inventory.types';

export function useUpdateWarehouse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: UpdateWarehouseRequest }) =>
      warehouseService.update(id, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.warehouses.lists() });
    },
  });
}
