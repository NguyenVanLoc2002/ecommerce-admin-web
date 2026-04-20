import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/constants/queryKeys';
import { productService } from '../services/productService';
import type { ProductListParams } from '../types/product.types';

export function useProducts(params: ProductListParams) {
  return useQuery({
    queryKey: queryKeys.products.list(params),
    queryFn: () => productService.getList(params),
    staleTime: 30_000,
  });
}
