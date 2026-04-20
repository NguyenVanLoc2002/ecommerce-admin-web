import { apiClient } from '@/shared/lib/axios';
import type { PaginatedResponse } from '@/shared/types/api.types';
import type { Payment, PaymentSummary, PaymentTransaction, PaymentListParams } from '../types/payment.types';

export const paymentService = {
  getList: (params: PaymentListParams) =>
    apiClient.get<PaginatedResponse<PaymentSummary>>('/admin/payments', { params }),

  getById: (id: number) =>
    apiClient.get<Payment>(`/admin/payments/${id}`),

  getTransactions: (id: number) =>
    apiClient.get<PaymentTransaction[]>(`/admin/payments/${id}/transactions`),

  completeCod: (orderId: number) =>
    apiClient.post<Payment>(`/admin/payments/order/${orderId}/complete`),
};
