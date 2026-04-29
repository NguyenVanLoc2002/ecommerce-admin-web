import { apiClient } from '@/shared/lib/axios';
import type { EntityId, PaginatedResponse } from '@/shared/types/api.types';
import type { Order, OrderSummary, OrderListParams } from '../types/order.types';

export const orderService = {
  async getList(params: OrderListParams): Promise<PaginatedResponse<OrderSummary>> {
    const response = await apiClient.get<PaginatedResponse<unknown>>('/admin/orders', {
      params: sanitizeOrderParams(params),
    });

    return {
      ...response,
      items: response.items.map((item) => normalizeOrderSummary(item)),
    };
  },

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

function sanitizeOrderParams(params: OrderListParams) {
  const customerId = normalizeString(params.customerId);

  return {
    page: params.page,
    size: params.size,
    ...(params.sort ? { sort: params.sort } : {}),
    ...(customerId ? { customerId } : {}),
    ...(params.status ? { status: params.status } : {}),
    ...(params.paymentStatus ? { paymentStatus: params.paymentStatus } : {}),
  };
}

function normalizeOrderSummary(input: unknown): OrderSummary {
  const record = toRecord(input);

  return {
    id: asString(record.id),
    orderCode: asString(record.orderCode),
    customerId: asString(record.customerId),
    status: asString(record.status) as OrderSummary['status'],
    paymentStatus: asNullableString(record.paymentStatus) as OrderSummary['paymentStatus'],
    paymentMethod: asNullableString(record.paymentMethod) as OrderSummary['paymentMethod'],
    totalAmount: asNumber(record.totalAmount) ?? 0,
    createdAt: asString(record.createdAt),
  };
}

function toRecord(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === 'object'
    ? (value as Record<string, unknown>)
    : {};
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

function normalizeString(value: string | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}
