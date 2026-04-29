import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/constants/queryKeys';
import { promotionService } from '../services/promotionService';

export function useDeleteRule(promotionId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ruleId: string) => promotionService.removeRule(promotionId, ruleId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.promotions.detail(promotionId) });
    },
  });
}
