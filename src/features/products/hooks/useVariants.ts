import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/constants/queryKeys';
import { variantService } from '../services/variantService';

export function useVariants(productId?: string) {
  return useQuery({
    queryKey: queryKeys.variants.byProduct(productId ?? ''),
    queryFn: () => variantService.getByProduct(productId ?? ''),
    staleTime: 30_000,
    enabled: Boolean(productId),
  });
}
