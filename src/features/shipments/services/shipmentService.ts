import { apiClient } from '@/shared/lib/axios';
import type { EntityId, PaginatedResponse } from '@/shared/types/api.types';
import { cleanParams } from '@/shared/utils/cleanParams';
import type {
  Shipment,
  ShipmentOrderReference,
  ShipmentSummary,
  ShipmentEvent,
  ShipmentListParams,
  CancelShipmentProviderRequest,
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

  async getByOrderId(orderId: EntityId): Promise<Shipment> {
    const response = await apiClient.get<unknown>(`/admin/shipments/order/${orderId}`);
    return normalizeShipment(response);
  },

  getOrderReference: (orderId: EntityId) =>
    apiClient.get<ShipmentOrderReference>(`/admin/orders/${orderId}`),

  async create(body: CreateShipmentRequest): Promise<Shipment> {
    const response = await apiClient.post<unknown>('/admin/shipments', body);
    return normalizeShipment(response);
  },

  async update(id: EntityId, body: UpdateShipmentRequest): Promise<Shipment> {
    const response = await apiClient.patch<unknown>(`/admin/shipments/${id}`, body);
    return normalizeShipment(response);
  },

  async updateStatus(id: EntityId, body: UpdateShipmentStatusRequest): Promise<Shipment> {
    const response = await apiClient.patch<unknown>(`/admin/shipments/${id}/status`, body);
    return normalizeShipment(response);
  },

  async syncProvider(id: EntityId): Promise<Shipment> {
    const response = await apiClient.post<unknown>(`/admin/shipments/${id}/provider/sync`);
    return normalizeShipment(response);
  },

  async cancelProvider(id: EntityId, body: CancelShipmentProviderRequest): Promise<Shipment> {
    const response = await apiClient.post<unknown>(`/admin/shipments/${id}/provider/cancel`, body);
    return normalizeShipment(response);
  },
};

function sanitizeShipmentParams(params: ShipmentListParams) {
  return cleanParams({
    page: params.page,
    size: params.size,
    sort: params.sort,
    orderId: normalizeString(params.orderId),
    orderCode: normalizeString(params.orderCode),
    carrier: normalizeString(params.carrier),
    carrierId: normalizeString(params.carrierId),
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
    carrierId: asNullableString(record.carrierId),
    trackingNumber: asNullableString(record.trackingNumber),
    carrier: asNullableString(record.carrier),
    carrierCode: asNullableString(record.carrierCode),
    carrierProviderType:
      asNullableString(record.carrierProviderType) as ShipmentSummary['carrierProviderType'],
    carrierShipmentId: asNullableString(record.carrierShipmentId),
    providerStatus: asNullableString(record.providerStatus),
    providerTrackingUrl: asNullableString(record.providerTrackingUrl),
    status: asString(record.status) as ShipmentSummary['status'],
    estimatedDeliveryDate: asNullableString(record.estimatedDeliveryDate),
    shippedAt: asNullableString(record.shippedAt),
    deliveredAt: asNullableString(record.deliveredAt),
    shippingFee: asNullableNumber(record.shippingFee),
    note: asNullableString(record.note),
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
    shippingFee: asNullableNumber(record.shippingFee),
    note: asNullableString(record.note),
    events: normalizeShipmentEvents(record.events),
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

function normalizeShipmentEvents(value: unknown): ShipmentEvent[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((item) => normalizeShipmentEvent(item));
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

function asNullableNumber(value: unknown): number | null {
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
