import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/constants/queryKeys';
import { promotionService } from '../services/promotionService';

export function useCreatePromotion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: promotionService.create,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.promotions.lists() });
      void queryClient.invalidateQueries({ queryKey: ['promotions', 'options'] });
    },
  });
}
