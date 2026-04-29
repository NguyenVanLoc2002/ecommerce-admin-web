import { apiClient } from '@/shared/lib/axios';
import type { EntityId, PaginatedResponse } from '@/shared/types/api.types';
import type { Order, OrderSummary, OrderListParams } from '../types/order.types';

export const orderService = {
  getList: (params: OrderListParams) =>
    apiClient.get<PaginatedResponse<OrderSummary>>('/admin/orders', { params }),

  getById: (id: EntityId) =>
    apiClient.get<Order>(`/admin/orders/${id}`),

  confirm: (id: EntityId) =>
    apiClient.post<Order>(`/admin/orders/${id}/confirm`),

  process: (id: EntityId) =>
    apiClient.post<Order>(`/admin/orders/${id}/process`),

  deliver: (id: EntityId) =>
    apiClient.post<Order>(`/admin/orders/${id}/deliver`),

  complete: (id: EntityId) =>
    apiClient.post<Order>(`/admin/orders/${id}/complete`),

  cancel: (id: EntityId) =>
    apiClient.post<Order>(`/admin/orders/${id}/cancel`),
};
