import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/constants/queryKeys';
import { warehouseOptionService } from '@/shared/services/warehouseOptionService';

export function useActiveWarehouseOptions() {
  return useQuery({
    queryKey: [...queryKeys.warehouses.all, 'options'],
    queryFn: warehouseOptionService.getActive,
    staleTime: 5 * 60_000,
  });
}
