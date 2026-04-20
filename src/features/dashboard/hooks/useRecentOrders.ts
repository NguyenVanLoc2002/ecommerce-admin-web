import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/constants/queryKeys';
import { dashboardService } from '../services/dashboardService';

export function useRecentOrders() {
  return useQuery({
    queryKey: [...queryKeys.dashboard.orders(), 'recent'],
    queryFn: dashboardService.getRecentOrders,
    staleTime: 30_000,
  });
}
