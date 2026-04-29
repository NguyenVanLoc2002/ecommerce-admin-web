import { apiClient } from '@/shared/lib/axios';
import type { EntityId, PaginatedResponse } from '@/shared/types/api.types';
import type {
  Payment,
  PaymentSummary,
  PaymentTransaction,
  PaymentListParams,
} from '../types/payment.types';

export const paymentService = {
  async getList(params: PaymentListParams): Promise<PaginatedResponse<PaymentSummary>> {
    const response = await apiClient.get<PaginatedResponse<unknown>>('/admin/payments', {
      params: sanitizePaymentParams(params),
    });

    return {
      ...response,
      items: response.items.map((item) => normalizePaymentSummary(item)),
    };
  },

  async getById(id: EntityId): Promise<Payment> {
    const response = await apiClient.get<unknown>(`/admin/payments/${id}`);
    return normalizePayment(response);
  },

  async getTransactions(id: EntityId): Promise<PaymentTransaction[]> {
    const response = await apiClient.get<unknown[]>(`/admin/payments/${id}/transactions`);
    return response.map((item) => normalizePaymentTransaction(item, id));
  },

  completeCod: (orderId: EntityId) =>
    apiClient.post<Payment>(`/admin/payments/order/${orderId}/complete`),
};

function sanitizePaymentParams(params: PaymentListParams) {
  const orderCode = normalizeString(params.orderCode);
  const dateFrom = normalizeString(params.dateFrom);
  const dateTo = normalizeString(params.dateTo);

  return {
    page: params.page,
    size: params.size,
    ...(params.sort ? { sort: params.sort } : {}),
    ...(orderCode ? { orderCode } : {}),
    ...(params.method ? { method: params.method } : {}),
    ...(params.status ? { status: params.status } : {}),
    ...(dateFrom ? { dateFrom } : {}),
    ...(dateTo ? { dateTo } : {}),
  };
}

function normalizePaymentSummary(input: unknown): PaymentSummary {
  const record = toRecord(input);

  return {
    id: asString(record.id),
    orderId: asString(record.orderId),
    orderCode: asString(record.orderCode),
    customer: normalizeCustomer(record),
    method: asString(record.method) as PaymentSummary['method'],
    status: asString(record.status) as PaymentSummary['status'],
    amount: asNumber(record.amount) ?? 0,
    paidAt: asNullableString(record.paidAt),
    transactionId: asNullableString(record.transactionId ?? record.providerTxnId),
    createdAt: asString(record.createdAt),
    updatedAt: asString(record.updatedAt ?? record.createdAt),
  };
}

function normalizePayment(input: unknown): Payment {
  const record = toRecord(input);
  const summary = normalizePaymentSummary(record);

  return {
    ...summary,
    failureReason: asNullableString(record.failureReason),
  };
}

function normalizePaymentTransaction(input: unknown, paymentId: EntityId): PaymentTransaction {
  const record = toRecord(input);

  return {
    id: asString(record.id),
    paymentId: asString(record.paymentId ?? paymentId),
    type: asString(record.type ?? record.method ?? record.transactionCode),
    amount: asNumber(record.amount) ?? 0,
    status: asString(record.status),
    gatewayRef: asNullableString(record.gatewayRef ?? record.providerTxnId),
    note: asNullableString(record.note),
    createdAt: asString(record.createdAt),
  };
}

function normalizeCustomer(record: Record<string, unknown>) {
  const customer = toRecord(record.customer);

  return {
    id: asString(customer.id ?? record.customerId),
    fullName: asString(customer.fullName ?? record.customerName ?? record.receiverName),
    email: asString(customer.email ?? record.customerEmail),
    phone: asString(customer.phone ?? record.customerPhone ?? record.receiverPhone),
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
