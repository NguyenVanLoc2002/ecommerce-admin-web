import { apiClient } from '@/shared/lib/axios';
import type { PaginatedResponse } from '@/shared/types/api.types';
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

  getById: (id: number) =>
    apiClient.get<Shipment>(`/admin/shipments/${id}`),

  getEvents: (id: number) =>
    apiClient.get<ShipmentEvent[]>(`/admin/shipments/${id}/events`),

  create: (body: CreateShipmentRequest) =>
    apiClient.post<Shipment>('/admin/shipments', body),

  update: (id: number, body: UpdateShipmentRequest) =>
    apiClient.patch<Shipment>(`/admin/shipments/${id}`, body),

  updateStatus: (id: number, body: UpdateShipmentStatusRequest) =>
    apiClient.patch<Shipment>(`/admin/shipments/${id}/status`, body),
};
