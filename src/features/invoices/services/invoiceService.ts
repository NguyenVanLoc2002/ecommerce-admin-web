import { apiClient } from '@/shared/lib/axios';
import type { PaginatedResponse } from '@/shared/types/api.types';
import type { Invoice, InvoiceListParams, UpdateInvoiceStatusRequest } from '../types/invoice.types';

export const invoiceService = {
  getList: (params: InvoiceListParams) =>
    apiClient.get<PaginatedResponse<Invoice>>('/admin/invoices', { params }),

  getById: (id: number) =>
    apiClient.get<Invoice>(`/admin/invoices/${id}`),

  getByOrder: (orderId: number) =>
    apiClient.get<Invoice>(`/admin/invoices/order/${orderId}`),

  generate: (orderId: number) =>
    apiClient.post<Invoice>(`/admin/invoices/order/${orderId}/generate`),

  updateStatus: (id: number, body: UpdateInvoiceStatusRequest) =>
    apiClient.patch<Invoice>(`/admin/invoices/${id}/status`, body),
};
