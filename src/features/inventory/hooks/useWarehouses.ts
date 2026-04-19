import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/constants/queryKeys';
import { warehouseService } from '../services/warehouseService';
import type { WarehouseListParams } from '../types/inventory.types';

export function useWarehouses(params: WarehouseListParams) {
  return useQuery({
    queryKey: queryKeys.warehouses.list(params),
    queryFn: () => warehouseService.getList(params),
    staleTime: 30_000,
  });
}
