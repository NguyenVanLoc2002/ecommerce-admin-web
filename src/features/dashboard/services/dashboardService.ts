import { apiClient } from '@/shared/lib/axios';
import type { PaginatedResponse } from '@/shared/types/api.types';
import { toISODateString } from '@/shared/utils/formatDate';
import type { DashboardOrder, DashboardReview, DashboardLowStockItem } from '../types/dashboard.types';

export const dashboardService = {
  // Orders API has no date filter — fetches most recent page as a proxy for volume
  getTodayOrderStats: () =>
    apiClient.get<PaginatedResponse<DashboardOrder>>('/admin/orders', {
      params: { page: 0, size: 1, sort: 'createdAt,desc' },
    }),

  // Orders API accepts a single status value only
  getPendingOrderStats: () =>
    apiClient.get<PaginatedResponse<DashboardOrder>>('/admin/orders', {
      params: { page: 0, size: 1, status: 'PENDING' },
    }),

  getTodayPaidPaymentStats: () => {
    const today = toISODateString(new Date());
    // Payments date filters (dateFrom/dateTo) filter on createdAt, not paidAt
    return apiClient.get<PaginatedResponse<{ id: number; amount: number }>>('/admin/payments', {
      params: { page: 0, size: 100, status: 'PAID', dateFrom: today, dateTo: today },
    });
  },

  getPendingReviewStats: () =>
    apiClient.get<PaginatedResponse<DashboardReview>>('/reviews/pending', {
      params: { page: 0, size: 1 },
    }),

  getLowStockStats: () =>
    apiClient.get<PaginatedResponse<DashboardLowStockItem>>('/admin/inventories', {
      params: { page: 0, size: 1 },
    }),

  getOutForDeliveryStats: () =>
    apiClient.get<PaginatedResponse<{ id: number }>>('/admin/shipments', {
      params: { page: 0, size: 1, status: 'OUT_FOR_DELIVERY' },
    }),

  getRecentOrders: () =>
    apiClient.get<PaginatedResponse<DashboardOrder>>('/admin/orders', {
      params: { page: 0, size: 10, sort: 'createdAt,desc' },
    }),

  getPendingReviews: () =>
    apiClient.get<PaginatedResponse<DashboardReview>>('/reviews/pending', {
      params: { page: 0, size: 5, sort: 'createdAt,asc' },
    }),

  getLowStockItems: () =>
    apiClient.get<PaginatedResponse<DashboardLowStockItem>>('/admin/inventories', {
      params: { page: 0, size: 10 },
    }),
};
