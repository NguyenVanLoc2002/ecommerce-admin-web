import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/constants/queryKeys';
import { brandService } from '../services/brandService';
import type { BrandListParams } from '../types/brand.types';

export function useBrands(params: BrandListParams) {
  return useQuery({
    queryKey: queryKeys.brands.list(params),
    queryFn: () => brandService.getList(params),
    staleTime: 30_000,
  });
}
