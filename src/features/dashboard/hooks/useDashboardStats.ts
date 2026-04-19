import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/constants/queryKeys';
import { dashboardService } from '../services/dashboardService';

export function useTodayOrderStats() {
  return useQuery({
    queryKey: queryKeys.dashboard.orders(),
    queryFn: dashboardService.getTodayOrderStats,
    staleTime: 30_000,
  });
}

export function usePendingOrderStats() {
  return useQuery({
    queryKey: [...queryKeys.dashboard.orders(), 'pending'],
    queryFn: dashboardService.getPendingOrderStats,
    staleTime: 30_000,
  });
}

export function useTodayPaidPaymentStats() {
  return useQuery({
    queryKey: queryKeys.dashboard.payments(),
    queryFn: dashboardService.getTodayPaidPaymentStats,
    staleTime: 30_000,
  });
}

export function usePendingReviewStats() {
  return useQuery({
    queryKey: queryKeys.dashboard.pendingReviews(),
    queryFn: dashboardService.getPendingReviewStats,
    staleTime: 30_000,
  });
}

export function useLowStockStats() {
  return useQuery({
    queryKey: queryKeys.dashboard.lowStock(),
    queryFn: dashboardService.getLowStockStats,
    staleTime: 30_000,
  });
}

export function useOutForDeliveryStats() {
  return useQuery({
    queryKey: queryKeys.dashboard.shipmentsOutForDelivery(),
    queryFn: dashboardService.getOutForDeliveryStats,
    staleTime: 30_000,
  });
}
