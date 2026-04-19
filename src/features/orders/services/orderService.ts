import { apiClient } from '@/shared/lib/axios';
import type { PaginatedResponse } from '@/shared/types/api.types';
import type {
  Order,
  OrderSummary,
  OrderListParams,
  UpdateOrderStatusRequest,
} from '../types/order.types';

export const orderService = {
  getList: (params: OrderListParams) =>
    apiClient.get<PaginatedResponse<OrderSummary>>('/admin/orders', { params }),

  getById: (id: number) =>
    apiClient.get<Order>(`/admin/orders/${id}`),

  updateStatus: (id: number, body: UpdateOrderStatusRequest) =>
    apiClient.patch<Order>(`/admin/orders/${id}/status`, body),
};
