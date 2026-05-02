import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/constants/queryKeys';
import { promotionService } from '../services/promotionService';

export function usePromotion(id?: string) {
  return useQuery({
    queryKey: queryKeys.promotions.detail(id ?? ''),
    queryFn: () => promotionService.getById(id ?? ''),
    staleTime: 60_000,
    enabled: Boolean(id),
  });
}
