import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/constants/queryKeys';
import { promotionService } from '../services/promotionService';
import type { UpdatePromotionRequest } from '../types/promotion.types';

export function useUpdatePromotion(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: UpdatePromotionRequest) => promotionService.update(id, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.promotions.lists() });
      void queryClient.invalidateQueries({ queryKey: queryKeys.promotions.detail(id) });
      void queryClient.invalidateQueries({ queryKey: ['promotions', 'options'] });
    },
  });
}
