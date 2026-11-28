import { apiClient } from '@/shared/lib/axios';
import type { EntityId, PaginatedResponse } from '@/shared/types/api.types';
import { cleanParams } from '@/shared/utils/cleanParams';
import type { Order, OrderItem, OrderSummary, OrderListParams } from '../types/order.types';
import { normalizeOrderItemMediaList } from '../utils/orderItemImage';

export interface CancellationOperation {
  id: string;
  orderId: string;
  orderCode: string;
  shipmentId: string | null;
  idempotencyKey: string;
  status: 'PENDING' | 'UNKNOWN' | 'CONFIRMED' | 'REJECTED';
  orderStatus: Order['status'];
  lastErrorCode: string | null;
  requestedAt: string | null;
  completedAt: string | null;
}

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

  async getById(id: EntityId): Promise<Order> {
    const response = await apiClient.get<unknown>(`/admin/orders/${id}`);
    return normalizeOrder(response);
  },

  confirm: (id: EntityId) =>
    apiClient.post<Order>(`/admin/orders/${id}/confirm`),

  process: (id: EntityId) =>
    apiClient.post<Order>(`/admin/orders/${id}/process`),

  deliver: (id: EntityId) =>
    apiClient.post<Order>(`/admin/orders/${id}/deliver`),

  complete: (id: EntityId) =>
    apiClient.post<Order>(`/admin/orders/${id}/complete`),

  cancel: (id: EntityId, body: { reason: string }) =>
    apiClient.post<CancellationOperation>(`/admin/orders/${id}/cancel`, body),

  reconcileCancellation: (id: EntityId, body: { confirmed: boolean; note: string }) =>
    apiClient.post<CancellationOperation>(`/admin/orders/${id}/cancellation/reconcile`, body),

  async getCancellation(id: EntityId): Promise<CancellationOperation | null> {
    const response = await apiClient.get<unknown>(`/admin/orders/${id}/cancellation`);
    if (response == null) return null;
    const record = toRecord(response);
    return {
      id: asString(record.id),
      orderId: asString(record.orderId),
      orderCode: asString(record.orderCode),
      shipmentId: asNullableString(record.shipmentId),
      idempotencyKey: asString(record.idempotencyKey),
      status: asString(record.status) as CancellationOperation['status'],
      orderStatus: asString(record.orderStatus) as Order['status'],
      lastErrorCode: asNullableString(record.lastErrorCode),
      requestedAt: asNullableString(record.requestedAt),
      completedAt: asNullableString(record.completedAt),
    };
  },
};

function sanitizeOrderParams(params: OrderListParams) {
  return cleanParams({
    page: params.page,
    size: params.size,
    sort: params.sort,
    customerId: normalizeString(params.customerId),
    keyword: normalizeString(params.keyword),
    status: params.status,
    paymentStatus: params.paymentStatus,
    paymentMethod: params.paymentMethod,
    shipmentStatus: params.shipmentStatus,
    createdFrom: normalizeLocalDateTimeToUtc(params.createdFrom),
    createdTo: normalizeLocalDateTimeToUtc(params.createdTo, true),
  });
}

function normalizeOrderSummary(input: unknown): OrderSummary {
  const record = toRecord(input);

  return {
    id: asString(record.id),
    orderCode: asString(record.orderCode),
    customerId: asString(record.customerId),
    customerNameSnapshot: asNullableString(record.customerNameSnapshot),
    customerEmailSnapshot: asNullableString(record.customerEmailSnapshot),
    customerSnapshotAvailable: record.customerSnapshotAvailable === true,
    customerName: asNullableString(record.customerName),
    customerEmail: asNullableString(record.customerEmail),
    currentCustomerProfileAvailable: record.currentCustomerProfileAvailable === true,
    status: asString(record.status) as OrderSummary['status'],
    paymentStatus: asNullableString(record.paymentStatus) as OrderSummary['paymentStatus'],
    paymentMethod: asNullableString(record.paymentMethod) as OrderSummary['paymentMethod'],
    shipmentStatus: asNullableString(record.shipmentStatus),
    carrier: asNullableString(record.carrier),
    trackingNumber: asNullableString(record.trackingNumber),
    attention: asNullableString(record.attention),
    attentionReason: asNullableString(record.attentionReason),
    totalAmount: asNumber(record.totalAmount) ?? 0,
    createdAt: asString(record.createdAt),
  };
}

function normalizeOrder(input: unknown): Order {
  const record = toRecord(input);
  const snapshot = toRecord(record.freeShippingSnapshot);
  const policyRevision = asNumber(snapshot.policyRevision);
  const threshold = asNumber(snapshot.threshold);
  const eligibleAmount = asNumber(snapshot.eligibleAmount);
  const quotedFee = asNumber(snapshot.quotedFee);

  return {
    id: asString(record.id),
    orderCode: asString(record.orderCode),
    customerId: asString(record.customerId),
    customerNameSnapshot: asNullableString(record.customerNameSnapshot),
    customerEmailSnapshot: asNullableString(record.customerEmailSnapshot),
    customerSnapshotAvailable: record.customerSnapshotAvailable === true,
    currentCustomerName: asNullableString(record.currentCustomerName),
    currentCustomerEmail: asNullableString(record.currentCustomerEmail),
    currentCustomerProfileAvailable: typeof record.currentCustomerProfileAvailable === 'boolean'
      ? record.currentCustomerProfileAvailable
      : null,
    status: asString(record.status) as Order['status'],
    paymentMethod: asString(record.paymentMethod) as Order['paymentMethod'],
    paymentStatus: asNullableString(record.paymentStatus) as Order['paymentStatus'],
    receiverName: asString(record.receiverName),
    receiverPhone: asString(record.receiverPhone),
    shippingStreet: asString(record.shippingStreet),
    shippingWard: asString(record.shippingWard),
    shippingDistrict: asString(record.shippingDistrict),
    shippingCity: asString(record.shippingCity),
    shippingPostalCode: asNullableString(record.shippingPostalCode),
    carrierId: asNullableString(record.carrierId),
    carrierCode: asNullableString(record.carrierCode),
    carrierName: asNullableString(record.carrierName),
    carrierProviderType: asNullableString(record.carrierProviderType) as Order['carrierProviderType'],
    subTotal: asNumber(record.subTotal) ?? 0,
    discountAmount: asNumber(record.discountAmount) ?? 0,
    shippingFee: asNumber(record.shippingFee) ?? 0,
    freeShippingSnapshot: policyRevision != null && threshold != null && eligibleAmount != null && quotedFee != null
      ? { policyRevision, threshold, eligibleAmount, quotedFee }
      : undefined,
    totalAmount: asNumber(record.totalAmount) ?? 0,
    voucherCode: asNullableString(record.voucherCode),
    customerNote: asNullableString(record.customerNote),
    items: Array.isArray(record.items)
      ? record.items.map((item) => normalizeOrderItem(item))
      : [],
    createdAt: asString(record.createdAt),
    updatedAt: asString(record.updatedAt ?? record.createdAt),
  };
}

function normalizeOrderItem(input: unknown): OrderItem {
  const record = toRecord(input);
  const product = toRecord(record.product);
  const variant = toRecord(record.variant);
  const unitPrice = asNumber(record.unitPrice) ?? 0;
  const quantity = asNumber(record.quantity) ?? 0;

  return {
    id: asString(record.id),
    variantId: asString(record.variantId ?? variant.id),
    productName: asString(record.productName ?? product.name),
    variantName: asString(record.variantName ?? variant.variantName ?? variant.name),
    sku: asString(record.sku ?? variant.sku),
    imageUrl: asNullableString(record.imageUrl ?? record.image_url),
    thumbnailUrl: asNullableString(record.thumbnailUrl ?? record.thumbnail_url),
    productImageUrl: asNullableString(
      record.productImageUrl
      ?? record.product_image_url
      ?? product.imageUrl
      ?? product.thumbnailUrl,
    ),
    variantImageUrl: asNullableString(
      record.variantImageUrl
      ?? record.variant_image_url
      ?? variant.imageUrl
      ?? variant.thumbnailUrl,
    ),
    productPrimaryImageUrl: asNullableString(
      record.productPrimaryImageUrl
      ?? record.product_primary_image_url
      ?? product.primaryImageUrl,
    ),
    variantPrimaryImageUrl: asNullableString(
      record.variantPrimaryImageUrl
      ?? record.variant_primary_image_url
      ?? variant.primaryImageUrl,
    ),
    productMedias: normalizeOrderItemMediaList(
      record.productMedias
      ?? record.productMedia
      ?? record.product_medias
      ?? record.product_media
      ?? product.medias
      ?? product.media,
    ),
    variantMedias: normalizeOrderItemMediaList(
      record.variantMedias
      ?? record.variantMedia
      ?? record.variant_medias
      ?? record.variant_media
      ?? variant.medias
      ?? variant.media,
    ),
    unitPrice,
    salePrice: asNullableNumber(record.salePrice),
    quantity,
    lineTotal: asNumber(record.lineTotal) ?? unitPrice * quantity,
    discountAmount: asNumber(record.discountAmount) ?? 0,
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

function asNullableNumber(value: unknown): number | null {
  return value == null ? null : asNumber(value);
}

function normalizeString(value: string | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function normalizeLocalDateTimeToUtc(value: string | undefined, includeWholeMinute = false) {
  if (!value) return undefined;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return undefined;
  if (includeWholeMinute) parsed.setTime(parsed.getTime() + 59_999);
  const iso = parsed.toISOString();
  return includeWholeMinute ? iso.slice(0, -1) : iso.slice(0, 19);
}
