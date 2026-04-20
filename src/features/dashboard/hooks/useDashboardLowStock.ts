import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/constants/queryKeys';
import { dashboardService } from '../services/dashboardService';

export function useDashboardLowStock() {
  return useQuery({
    queryKey: [...queryKeys.dashboard.lowStock(), 'panel'],
    queryFn: dashboardService.getLowStockItems,
    staleTime: 30_000,
  });
}
