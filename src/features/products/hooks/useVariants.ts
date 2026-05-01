import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/constants/queryKeys';
import { variantService } from '../services/variantService';
import type { VariantListParams } from '../types/product.types';

export function useVariants(productId?: string, params?: VariantListParams) {
  return useQuery({
    queryKey: [...queryKeys.variants.byProduct(productId ?? ''), params ?? {}],
    queryFn: () => variantService.getByProduct(productId ?? '', params),
    staleTime: 30_000,
    enabled: Boolean(productId),
  });
}
