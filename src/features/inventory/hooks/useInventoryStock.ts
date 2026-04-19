import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/constants/queryKeys';
import { inventoryService } from '../services/inventoryService';
import type { InventoryStockParams } from '../types/inventory.types';

export function useInventoryStock(params: InventoryStockParams) {
  return useQuery({
    queryKey: queryKeys.inventory.stock(params),
    queryFn: () => inventoryService.getStock(params),
    staleTime: 30_000,
  });
}
