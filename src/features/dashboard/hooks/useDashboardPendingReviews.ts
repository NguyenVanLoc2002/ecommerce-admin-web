import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/constants/queryKeys';
import { dashboardService } from '../services/dashboardService';

export function useDashboardPendingReviews() {
  return useQuery({
    queryKey: [...queryKeys.dashboard.pendingReviews(), 'panel'],
    queryFn: dashboardService.getPendingReviews,
    staleTime: 30_000,
  });
}
