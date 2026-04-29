import { apiClient } from '@/shared/lib/axios';
import type { EntityId, PaginatedResponse } from '@/shared/types/api.types';
import type {
  Invoice,
  InvoiceSummary,
  InvoiceListParams,
  UpdateInvoiceStatusRequest,
} from '../types/invoice.types';

export const invoiceService = {
  async getList(params: InvoiceListParams): Promise<PaginatedResponse<InvoiceSummary>> {
    const response = await apiClient.get<PaginatedResponse<unknown>>('/admin/invoices', { params });

    return {
      ...response,
      items: response.items.map((item) => normalizeInvoiceSummary(item)),
    };
  },

  getById: (id: EntityId) =>
    apiClient.get<Invoice>(`/admin/invoices/${id}`),

  getByOrder: (orderId: EntityId) =>
    apiClient.get<Invoice>(`/admin/invoices/order/${orderId}`),

  generate: (orderId: EntityId) =>
    apiClient.post<Invoice>(`/admin/invoices/order/${orderId}/generate`),

  updateStatus: (id: EntityId, body: UpdateInvoiceStatusRequest) =>
    apiClient.patch<Invoice>(`/admin/invoices/${id}/status`, body),
};

function normalizeInvoiceSummary(input: unknown): InvoiceSummary {
  const record = toRecord(input);

  return {
    id: asString(record.id),
    invoiceCode: asString(record.invoiceCode),
    orderId: asString(record.orderId),
    orderCode: asString(record.orderCode),
    status: asString(record.status) as InvoiceSummary['status'],
    issuedAt: asString(record.issuedAt),
    paidAt: asNullableString(record.paidAt),
    totalAmount: asNumber(record.totalAmount) ?? 0,
    receiverName: asString(record.receiverName),
    receiverPhone: asString(record.receiverPhone),
    createdAt: asString(record.createdAt ?? record.issuedAt),
    updatedAt: asString(record.updatedAt ?? record.createdAt ?? record.issuedAt),
  };
}

function toRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
}

function asString(value: unknown): string {
  return typeof value === 'string' ? value : value == null ? '' : String(value);
}

function asNullableString(value: unknown): string | null {
  return value == null || value === '' ? null : String(value);
}

function asNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}
