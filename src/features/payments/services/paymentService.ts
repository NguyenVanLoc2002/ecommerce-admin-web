import { apiClient } from '@/shared/lib/axios';
import type { EntityId, PaginatedResponse } from '@/shared/types/api.types';
import type { Payment, PaymentSummary, PaymentTransaction, PaymentListParams } from '../types/payment.types';

export const paymentService = {
  getList: (params: PaymentListParams) =>
    apiClient.get<PaginatedResponse<PaymentSummary>>('/admin/payments', { params }),

  getById: (id: EntityId) =>
    apiClient.get<Payment>(`/admin/payments/${id}`),

  getTransactions: (id: EntityId) =>
    apiClient.get<PaymentTransaction[]>(`/admin/payments/${id}/transactions`),

  completeCod: (orderId: EntityId) =>
    apiClient.post<Payment>(`/admin/payments/order/${orderId}/complete`),
};
