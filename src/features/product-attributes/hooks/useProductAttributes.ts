import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/constants/queryKeys';
import { productAttributeService } from '../services/productAttributeService';
import type { ProductAttributeListParams } from '../types/productAttribute.types';

export function useProductAttributes(params: ProductAttributeListParams) {
  return useQuery({
    queryKey: queryKeys.productAttributes.list(params),
    queryFn: () => productAttributeService.getList(params),
    staleTime: 30_000,
  });
}
