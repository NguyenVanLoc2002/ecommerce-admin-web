import type { PaginationParams, EntityId } from '@/shared/types/api.types';
import type { ShipmentStatus } from '@/shared/types/enums';

export interface ShipmentAddress {
  fullName: string;
  phone: string;
  street: string;
  ward: string;
  district: string;
  province: string;
}

export interface ShipmentCustomer {
  fullName: string;
  email: string;
  phone: string;
}

export interface ShipmentSummary {
  id: EntityId;
  orderId: EntityId;
  orderCode: string;
  customer: ShipmentCustomer;
  trackingNumber: string | null;
  carrier: string | null;
  status: ShipmentStatus;
  estimatedDeliveryDate: string | null;
  shippedAt: string | null;
  deliveredAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Shipment {
  id: EntityId;
  orderId: EntityId;
  orderCode: string;
  customer: ShipmentCustomer;
  shippingAddress: ShipmentAddress;
  trackingNumber: string | null;
  carrier: string | null;
  status: ShipmentStatus;
  estimatedDeliveryDate: string | null;
  shippedAt: string | null;
  deliveredAt: string | null;
  note: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ShipmentEvent {
  id: EntityId;
  status: ShipmentStatus;
  note: string | null;
  createdAt: string;
  createdBy: string | null;
}

export interface ShipmentListParams extends PaginationParams {
  orderCode?: string;
  carrier?: string;
  status?: ShipmentStatus;
  orderId?: EntityId;
  dateFrom?: string;
  dateTo?: string;
}

export interface CreateShipmentRequest {
  orderId: EntityId;
  carrier: string | null;
  trackingNumber: string | null;
  estimatedDeliveryDate: string | null;
  note: string | null;
}

export interface UpdateShipmentRequest {
  carrier?: string | null;
  trackingNumber?: string | null;
  estimatedDeliveryDate?: string | null;
  note?: string | null;
}

export interface UpdateShipmentStatusRequest {
  status: ShipmentStatus;
  description?: string;
  location?: string;
  eventTime?: string;
}
