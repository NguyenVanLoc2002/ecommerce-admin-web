import { apiClient } from '@/shared/lib/axios';
import type { EntityId, PaginatedResponse } from '@/shared/types/api.types';
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
  getList: (params: ShipmentListParams) =>
    apiClient.get<PaginatedResponse<ShipmentSummary>>('/admin/shipments', { params }),

  getById: (id: EntityId) =>
    apiClient.get<Shipment>(`/admin/shipments/${id}`),

  getEvents: (id: EntityId) =>
    apiClient.get<ShipmentEvent[]>(`/admin/shipments/${id}/events`),

  create: (body: CreateShipmentRequest) =>
    apiClient.post<Shipment>('/admin/shipments', body),

  update: (id: EntityId, body: UpdateShipmentRequest) =>
    apiClient.patch<Shipment>(`/admin/shipments/${id}`, body),

  updateStatus: (id: EntityId, body: UpdateShipmentStatusRequest) =>
    apiClient.patch<Shipment>(`/admin/shipments/${id}/status`, body),
};
