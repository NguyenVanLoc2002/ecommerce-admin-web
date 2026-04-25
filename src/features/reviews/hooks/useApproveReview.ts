import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/constants/queryKeys';
import { toast } from '@/shared/stores/uiStore';
import type { AppError } from '@/shared/types/api.types';
import { reviewService } from '../services/reviewService';

export function useApproveReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, adminNote }: { id: number; adminNote?: string }) =>
      reviewService.moderate(id, { action: 'APPROVED', adminNote }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.reviews.all });
    },
    onError: (error: Error) => {
      const appError = error as AppError;
      if (appError.code === 'REVIEW_ALREADY_MODERATED') {
        toast.error('This review was already moderated. Refreshing…');
        setTimeout(() => {
          void queryClient.invalidateQueries({ queryKey: queryKeys.reviews.all });
        }, 1000);
      } else {
        toast.error(appError.message ?? 'Failed to approve review.');
      }
    },
  });
}
