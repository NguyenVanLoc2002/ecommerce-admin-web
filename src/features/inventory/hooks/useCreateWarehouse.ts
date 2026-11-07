import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/constants/queryKeys';
import { warehouseService } from '../services/warehouseService';
import type { CreateWarehouseRequest } from '../types/inventory.types';

export function useCreateWarehouse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateWarehouseRequest) => warehouseService.create(body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.warehouses.all });
    },
  });
}
