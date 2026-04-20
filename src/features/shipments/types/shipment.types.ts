import type { PaginationParams } from '@/shared/types/api.types';
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
  id: number;
  orderId: number;
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
  id: number;
  orderId: number;
  orderCode: string;
  customer: ShipmentCustomer;
  shippingAddress: ShipmentAddress;
  trackingNumber: string | null;
  carrier: string | null;
  status: ShipmentStatus;
  estimatedDeliveryDate: string | null;
  shippedAt: string | null;
  deliveredAt: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ShipmentEvent {
  id: number;
  status: ShipmentStatus;
  note: string | null;
  createdAt: string;
  createdBy: string | null;
}

export interface ShipmentListParams extends PaginationParams {
  keyword?: string;
  status?: string;
  orderId?: number;
  fromDate?: string;
  toDate?: string;
}

export interface CreateShipmentRequest {
  orderId: number;
  carrier: string | null;
  trackingNumber: string | null;
  estimatedDeliveryDate: string | null;
  notes: string | null;
}

export interface UpdateShipmentRequest {
  carrier?: string | null;
  trackingNumber?: string | null;
  estimatedDeliveryDate?: string | null;
  notes?: string | null;
}

export interface UpdateShipmentStatusRequest {
  status: ShipmentStatus;
  note?: string;
}
