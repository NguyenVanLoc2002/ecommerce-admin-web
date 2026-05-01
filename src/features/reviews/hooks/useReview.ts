import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/constants/queryKeys';
import { reviewService } from '../services/reviewService';

export function useReview(id?: string) {
  return useQuery({
    queryKey: queryKeys.reviews.detail(id ?? ''),
    queryFn: () => reviewService.getById(id ?? ''),
    staleTime: 60_000,
    enabled: Boolean(id),
  });
}
