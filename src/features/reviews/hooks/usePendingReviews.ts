import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/constants/queryKeys';
import { reviewService } from '../services/reviewService';
import type { ReviewListParams } from '../types/review.types';

export function usePendingReviews(params: ReviewListParams) {
  return useQuery({
    queryKey: queryKeys.reviews.list(params),
    queryFn: () => reviewService.getList(params),
    staleTime: 30_000,
  });
}
