import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/constants/queryKeys';
import { attributeCatalogService } from '../services/attributeCatalogService';

export function useVariantAttributes() {
  return useQuery({
    queryKey: queryKeys.productAttributes.variantOptions(),
    queryFn: () => attributeCatalogService.getVariantAttributes(),
    staleTime: 30_000,
  });
}
