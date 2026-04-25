import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/constants/queryKeys';
import { promotionService } from '../services/promotionService';
import type { PromotionListParams } from '../types/promotion.types';

export function usePromotions(params: PromotionListParams) {
  return useQuery({
    queryKey: queryKeys.promotions.list(params),
    queryFn: () => promotionService.getList(params),
    staleTime: 30_000,
  });
}
