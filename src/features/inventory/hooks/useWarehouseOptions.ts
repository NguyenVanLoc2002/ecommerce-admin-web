import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/constants/queryKeys';
import { warehouseService } from '../services/warehouseService';

export function useWarehouseOptions() {
  return useQuery({
    queryKey: [...queryKeys.warehouses.all, 'options'],
    queryFn: () =>
      warehouseService.getList({
        status: 'ACTIVE',
        deletedState: 'ACTIVE',
      }),
    staleTime: 5 * 60_000,
  });
}
