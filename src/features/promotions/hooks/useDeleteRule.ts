import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/constants/queryKeys';
import { promotionService } from '../services/promotionService';

export function useDeleteRule(promotionId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ruleId: number) => promotionService.removeRule(promotionId, ruleId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.promotions.detail(promotionId) });
    },
  });
}
