import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/constants/queryKeys';
import { productAttributeService } from '../services/productAttributeService';

export function useProductAttribute(id?: string) {
  return useQuery({
    queryKey: queryKeys.productAttributes.detail(id ?? ''),
    queryFn: () => productAttributeService.getById(id ?? ''),
    staleTime: 60_000,
    enabled: Boolean(id),
  });
}
