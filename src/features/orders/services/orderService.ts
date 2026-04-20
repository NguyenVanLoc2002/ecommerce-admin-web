import { apiClient } from '@/shared/lib/axios';
import type { PaginatedResponse } from '@/shared/types/api.types';
import type { Order, OrderSummary, OrderListParams } from '../types/order.types';

export const orderService = {
  getList: (params: OrderListParams) =>
    apiClient.get<PaginatedResponse<OrderSummary>>('/admin/orders', { params }),

  getById: (id: number) =>
    apiClient.get<Order>(`/admin/orders/${id}`),

  confirm: (id: number) =>
    apiClient.post<Order>(`/admin/orders/${id}/confirm`),

  process: (id: number) =>
    apiClient.post<Order>(`/admin/orders/${id}/process`),

  deliver: (id: number) =>
    apiClient.post<Order>(`/admin/orders/${id}/deliver`),

  complete: (id: number) =>
    apiClient.post<Order>(`/admin/orders/${id}/complete`),

  cancel: (id: number) =>
    apiClient.post<Order>(`/admin/orders/${id}/cancel`),
};
