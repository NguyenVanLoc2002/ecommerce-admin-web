import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/constants/queryKeys';
import { SoftDeleteState } from '@/shared/types/api.types';
import { cleanParams } from '@/shared/utils/cleanParams';
import { productService } from '@/features/products/services/productService';

export function useInventoryProductOptions(keyword: string, enabled = true) {
  const params = {
    page: 0,
    size: 20,
    sort: 'name,asc',
    keyword: keyword || undefined,
    deletedState: SoftDeleteState.ACTIVE,
  } as const;

  return useQuery({
    queryKey: [...queryKeys.products.lists(), 'inventory-options', cleanParams(params)],
    queryFn: () => productService.getList(params),
    staleTime: 30_000,
    enabled,
  });
}
