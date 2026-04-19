import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/constants/queryKeys';
import { inventoryService } from '../services/inventoryService';
import type { StockMovementParams } from '../types/inventory.types';

export function useStockMovements(params: StockMovementParams) {
  return useQuery({
    queryKey: queryKeys.inventory.movements(params),
    queryFn: () => inventoryService.getMovements(params),
    staleTime: 30_000,
  });
}
