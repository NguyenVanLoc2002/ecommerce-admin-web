import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/constants/queryKeys';
import { promotionService } from '../services/promotionService';
import type { CreateRuleRequest } from '../types/promotion.types';

export function useCreateRule(promotionId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateRuleRequest) => promotionService.addRule(promotionId, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.promotions.detail(promotionId) });
    },
  });
}
