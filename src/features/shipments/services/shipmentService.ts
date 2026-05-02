import { apiClient } from '@/shared/lib/axios';
import type { EntityId, PaginatedResponse } from '@/shared/types/api.types';
import { cleanParams } from '@/shared/utils/cleanParams';
import type {
  Shipment,
  ShipmentSummary,
  ShipmentEvent,
  ShipmentListParams,
  CreateShipmentRequest,
  UpdateShipmentRequest,
  UpdateShipmentStatusRequest,
} from '../types/shipment.types';

export const shipmentService = {
  async getList(params: ShipmentListParams): Promise<PaginatedResponse<ShipmentSummary>> {
    const response = await apiClient.get<PaginatedResponse<unknown>>('/admin/shipments', {
      params: sanitizeShipmentParams(params),
    });

    return {
      ...response,
      items: response.items.map((item) => normalizeShipmentSummary(item)),
    };
  },

  async getById(id: EntityId): Promise<Shipment> {
    const response = await apiClient.get<unknown>(`/admin/shipments/${id}`);
    return normalizeShipment(response);
  },

  async getEvents(id: EntityId): Promise<ShipmentEvent[]> {
    const response = await apiClient.get<unknown[]>(`/admin/shipments/${id}/events`);
    return response.map((item) => normalizeShipmentEvent(item));
  },

  create: (body: CreateShipmentRequest) =>
    apiClient.post<Shipment>('/admin/shipments', body),

  update: (id: EntityId, body: UpdateShipmentRequest) =>
    apiClient.patch<Shipment>(`/admin/shipments/${id}`, body),

  updateStatus: (id: EntityId, body: UpdateShipmentStatusRequest) =>
    apiClient.patch<Shipment>(`/admin/shipments/${id}/status`, body),
};

function sanitizeShipmentParams(params: ShipmentListParams) {
  return cleanParams({
    page: params.page,
    size: params.size,
    sort: params.sort,
    orderId: normalizeString(params.orderId),
    orderCode: normalizeString(params.orderCode),
    carrier: normalizeString(params.carrier),
    status: params.status,
    dateFrom: normalizeString(params.dateFrom),
    dateTo: normalizeString(params.dateTo),
  });
}

function normalizeShipmentSummary(input: unknown): ShipmentSummary {
  const record = toRecord(input);

  return {
    id: asString(record.id),
    orderId: asString(record.orderId),
    orderCode: asString(record.orderCode),
    shipmentCode: asString(record.shipmentCode),
    customer: normalizeShipmentCustomer(record),
    trackingNumber: asNullableString(record.trackingNumber),
    carrier: asNullableString(record.carrier),
    status: asString(record.status) as ShipmentSummary['status'],
    estimatedDeliveryDate: asNullableString(record.estimatedDeliveryDate),
    shippedAt: asNullableString(record.shippedAt),
    deliveredAt: asNullableString(record.deliveredAt),
    createdAt: asString(record.createdAt),
    updatedAt: asString(record.updatedAt ?? record.createdAt),
  };
}

function normalizeShipment(input: unknown): Shipment {
  const record = toRecord(input);
  const summary = normalizeShipmentSummary(record);
  const shippingAddress = toRecord(record.shippingAddress);

  return {
    ...summary,
    shippingAddress: {
      fullName: asString(record.receiverName ?? shippingAddress.fullName),
      phone: asString(record.receiverPhone ?? shippingAddress.phone),
      street: asString(record.shippingStreet ?? shippingAddress.street),
      ward: asString(record.shippingWard ?? shippingAddress.ward),
      district: asString(record.shippingDistrict ?? shippingAddress.district),
      province: asString(record.shippingCity ?? shippingAddress.province),
    },
    note: asNullableString(record.note),
  };
}

function normalizeShipmentEvent(input: unknown): ShipmentEvent {
  const record = toRecord(input);

  return {
    id: asString(record.id),
    status: asString(record.status) as ShipmentEvent['status'],
    note: asNullableString(record.note ?? record.description),
    createdAt: asString(record.createdAt ?? record.eventTime),
    createdBy: asNullableString(record.createdBy),
  };
}

function normalizeShipmentCustomer(record: Record<string, unknown>) {
  const customer = toRecord(record.customer);

  return {
    fullName: asString(customer.fullName ?? record.receiverName ?? record.customerName),
    email: asString(customer.email ?? record.customerEmail),
    phone: asString(customer.phone ?? record.receiverPhone ?? record.customerPhone),
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

function normalizeString(value: string | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}
