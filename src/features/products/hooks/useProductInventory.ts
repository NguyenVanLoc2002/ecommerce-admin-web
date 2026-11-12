import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/constants/queryKeys';
import { productInventoryService } from '../services/productInventoryService';

export function useProductInventory(productId?: string) {
  return useQuery({
    queryKey: queryKeys.products.inventory(productId ?? ''),
    queryFn: () => productInventoryService.getByProductId(productId ?? ''),
    staleTime: 30_000,
    enabled: Boolean(productId),
  });
}
