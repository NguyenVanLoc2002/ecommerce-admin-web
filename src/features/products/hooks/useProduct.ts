import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/constants/queryKeys';
import { productService } from '../services/productService';

export function useProduct(id?: string) {
  return useQuery({
    queryKey: queryKeys.products.detail(id ?? ''),
    queryFn: () => productService.getById(id ?? ''),
    staleTime: 60_000,
    enabled: Boolean(id),
  });
}
