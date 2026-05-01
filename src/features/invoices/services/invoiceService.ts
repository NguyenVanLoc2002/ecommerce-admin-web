import { apiClient } from '@/shared/lib/axios';
import type { EntityId, PaginatedResponse } from '@/shared/types/api.types';
import { cleanParams } from '@/shared/utils/cleanParams';
import type { OrderPaymentStatus, PaymentMethod } from '@/shared/types/enums';
import type {
  Invoice,
  InvoiceSummary,
  InvoiceListParams,
  UpdateInvoiceStatusRequest,
} from '../types/invoice.types';

export const invoiceService = {
  async getList(params: InvoiceListParams): Promise<PaginatedResponse<InvoiceSummary>> {
    const response = await apiClient.get<PaginatedResponse<unknown>>('/admin/invoices', {
      params: sanitizeInvoiceParams(params),
    });

    return {
      ...response,
      items: response.items.map((item) => normalizeInvoiceSummary(item)),
    };
  },

  async getById(id: EntityId): Promise<Invoice> {
    const response = await apiClient.get<unknown>(`/admin/invoices/${id}`);
    return normalizeInvoice(response);
  },

  async getByOrder(orderId: EntityId): Promise<Invoice> {
    const response = await apiClient.get<unknown>(`/admin/invoices/order/${orderId}`);
    return normalizeInvoice(response);
  },

  async getByCode(invoiceCode: string): Promise<Invoice> {
    const response = await apiClient.get<unknown>(`/admin/invoices/code/${invoiceCode}`);
    return normalizeInvoice(response);
  },

  async generate(orderId: EntityId): Promise<Invoice> {
    const response = await apiClient.post<unknown>(`/admin/invoices/order/${orderId}/generate`);
    return normalizeInvoice(response);
  },

  async updateStatus(id: EntityId, body: UpdateInvoiceStatusRequest): Promise<Invoice> {
    const response = await apiClient.patch<unknown>(`/admin/invoices/${id}/status`, body);
    return normalizeInvoice(response);
  },
};

function sanitizeInvoiceParams(params: InvoiceListParams) {
  return cleanParams({
    page: params.page,
    size: params.size,
    sort: params.sort,
    invoiceCode: normalizeString(params.invoiceCode),
    orderCode: normalizeString(params.orderCode),
    status: normalizeString(params.status),
    dateFrom: normalizeString(params.dateFrom),
    dateTo: normalizeString(params.dateTo),
  });
}

function normalizeInvoiceSummary(input: unknown): InvoiceSummary {
  const record = toRecord(input);

  return {
    id: asString(record.id),
    invoiceCode: asString(record.invoiceCode),
    orderId: asString(record.orderId),
    orderCode: asString(record.orderCode),
    status: asString(record.status) as InvoiceSummary['status'],
    issuedAt: asString(record.issuedAt),
    dueDate: asNullableString(record.dueDate),
    paymentStatus: asNullableString(record.paymentStatus) as OrderPaymentStatus | null,
    paidAt: asNullableString(record.paidAt),
    totalAmount: asNumber(record.totalAmount) ?? 0,
    customerName: asString(record.customerName ?? record.receiverName),
    customerEmail: asNullableString(record.customerEmail),
    customerPhone: asNullableString(record.customerPhone ?? record.receiverPhone),
    createdAt: asString(record.createdAt ?? record.issuedAt),
    notes: asNullableString(record.notes),
  };
}

function normalizeInvoice(input: unknown): Invoice {
  const record = toRecord(input);
  const summary = normalizeInvoiceSummary(record);
  const items = Array.isArray(record.items)
    ? record.items
    : Array.isArray(record.lineItems)
      ? record.lineItems
      : [];

  return {
    ...summary,
    paymentMethod: asNullableString(record.paymentMethod) as PaymentMethod | null,
    billingStreet: asNullableString(record.billingStreet ?? record.shippingStreet),
    billingWard: asNullableString(record.billingWard ?? record.shippingWard),
    billingDistrict: asNullableString(record.billingDistrict ?? record.shippingDistrict),
    billingCity: asNullableString(record.billingCity ?? record.shippingCity),
    billingPostalCode: asNullableString(record.billingPostalCode ?? record.shippingPostalCode),
    subTotal: asNumber(record.subTotal) ?? 0,
    discountAmount: asNumber(record.discountAmount) ?? 0,
    shippingFee: asNumber(record.shippingFee) ?? 0,
    totalAmount: asNumber(record.totalAmount) ?? 0,
    voucherCode: asNullableString(record.voucherCode),
    lineItems: items.map((item) => normalizeInvoiceLineItem(item)),
  };
}

function normalizeInvoiceLineItem(input: unknown): Invoice['lineItems'][number] {
  const record = toRecord(input);
  const unitPrice = asNumber(record.unitPrice) ?? 0;
  const salePrice = asNumber(record.salePrice);
  const effectivePrice = asNumber(record.effectivePrice) ?? salePrice ?? unitPrice;

  return {
    variantId: asString(record.variantId),
    productName: asString(record.productName),
    variantName: asNullableString(record.variantName),
    sku: asNullableString(record.sku),
    unitPrice,
    salePrice,
    effectivePrice,
    quantity: asNumber(record.quantity) ?? 0,
    lineTotal: asNumber(record.lineTotal) ?? 0,
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

function normalizeString(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}
