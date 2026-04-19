import { apiClient } from '@/shared/lib/axios';
import type { PaginatedResponse } from '@/shared/types/api.types';
import { toISODateString } from '@/shared/utils/formatDate';
import type { DashboardOrder, DashboardReview, DashboardLowStockItem } from '../types/dashboard.types';

export const dashboardService = {
  getTodayOrderStats: () => {
    const today = toISODateString(new Date());
    return apiClient.get<PaginatedResponse<DashboardOrder>>('/admin/orders', {
      params: { page: 0, size: 1, createdAtFrom: today, createdAtTo: today },
    });
  },

  getPendingOrderStats: () =>
    apiClient.get<PaginatedResponse<DashboardOrder>>('/admin/orders', {
      params: { page: 0, size: 1, status: 'PENDING,AWAITING_PAYMENT' },
    }),

  getTodayPaidPaymentStats: () => {
    const today = toISODateString(new Date());
    return apiClient.get<PaginatedResponse<{ id: number; amount: number }>>('/admin/payments', {
      params: { page: 0, size: 100, status: 'PAID', paidAtFrom: today, paidAtTo: today },
    });
  },

  getPendingReviewStats: () =>
    apiClient.get<PaginatedResponse<DashboardReview>>('/admin/reviews/pending', {
      params: { page: 0, size: 1 },
    }),

  getLowStockStats: () =>
    apiClient.get<PaginatedResponse<DashboardLowStockItem>>('/admin/inventories/reservations', {
      params: { page: 0, size: 1, maxAvailable: 5 },
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
    apiClient.get<PaginatedResponse<DashboardReview>>('/admin/reviews/pending', {
      params: { page: 0, size: 5, sort: 'createdAt,asc' },
    }),

  getLowStockItems: () =>
    apiClient.get<PaginatedResponse<DashboardLowStockItem>>('/admin/inventories/reservations', {
      params: { page: 0, size: 10, maxAvailable: 5 },
    }),
};
