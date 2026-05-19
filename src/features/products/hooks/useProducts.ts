import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/constants/queryKeys';
import { productService } from '../services/productService';
import type { ProductListRequestParams } from '../utils/productListQuery';

export function useProducts(params: ProductListRequestParams) {
  return useQuery({
    queryKey: queryKeys.products.list(params),
    queryFn: () => productService.getList(params),
    staleTime: 30_000,
  });
}
