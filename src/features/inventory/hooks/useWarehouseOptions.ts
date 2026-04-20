import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/constants/queryKeys';
import { warehouseService } from '../services/warehouseService';

export function useWarehouseOptions() {
  return useQuery({
    queryKey: [...queryKeys.warehouses.all, 'options'],
    queryFn: () =>
      warehouseService.getList({ page: 0, size: 200, sort: 'name,asc', status: 'ACTIVE' }),
    staleTime: 5 * 60_000,
  });
}
