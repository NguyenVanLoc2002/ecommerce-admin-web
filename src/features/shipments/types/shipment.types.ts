import type { PaginationParams, EntityId } from '@/shared/types/api.types';
import type { CarrierProviderType, ShipmentStatus } from '@/shared/types/enums';

export type BookingAttemptStatus = 'PENDING' | 'SUCCEEDED' | 'FAILED_FINAL' | 'UNKNOWN' | 'INTERNAL_ONLY';
export type CarrierOverrideReason =
  | 'CHECKOUT_CARRIER_UNAVAILABLE'
  | 'CUSTOMER_REQUEST'
  | 'SERVICE_ISSUE'
  | 'COST_CHANGE'
  | 'OTHER';

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

export interface ShipmentOrderReference {
  id: EntityId;
  orderCode: string;
  carrierId: EntityId | null;
  carrierCode: string | null;
  carrierName: string | null;
  carrierProviderType: CarrierProviderType | null;
  shippingFee: number;
  totalAmount: number;
}

export interface ShipmentSummary {
  id: EntityId;
  orderId: EntityId;
  orderCode: string;
  shipmentCode: string;
  customer: ShipmentCustomer;
  carrierId: EntityId | null;
  trackingNumber: string | null;
  carrier: string | null;
  carrierCode: string | null;
  carrierProviderType: CarrierProviderType | null;
  carrierShipmentId: string | null;
  providerStatus: string | null;
  providerTrackingUrl: string | null;
  status: ShipmentStatus;
  estimatedDeliveryDate: string | null;
  shippedAt: string | null;
  deliveredAt: string | null;
  shippingFee: number | null;
  carrierCost: number | null;
  estimatedCarrierCost: number | null;
  bookingStatus: BookingAttemptStatus | null;
  bookingAttemptKey: string | null;
  overrideReasonCode: CarrierOverrideReason | null;
  overrideNote: string | null;
  overrideFromCarrierId: EntityId | null;
  overrideToCarrierId: EntityId | null;
  overrideActor: string | null;
  overrideAt: string | null;
  note: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Shipment {
  id: EntityId;
  orderId: EntityId;
  orderCode: string;
  shipmentCode: string;
  customer: ShipmentCustomer;
  shippingAddress: ShipmentAddress;
  carrierId: EntityId | null;
  trackingNumber: string | null;
  carrier: string | null;
  carrierCode: string | null;
  carrierProviderType: CarrierProviderType | null;
  carrierShipmentId: string | null;
  providerStatus: string | null;
  providerTrackingUrl: string | null;
  status: ShipmentStatus;
  estimatedDeliveryDate: string | null;
  shippedAt: string | null;
  deliveredAt: string | null;
  shippingFee: number | null;
  carrierCost: number | null;
  estimatedCarrierCost: number | null;
  bookingStatus: BookingAttemptStatus | null;
  bookingAttemptKey: string | null;
  overrideReasonCode: CarrierOverrideReason | null;
  overrideNote: string | null;
  overrideFromCarrierId: EntityId | null;
  overrideToCarrierId: EntityId | null;
  overrideActor: string | null;
  overrideAt: string | null;
  note: string | null;
  events: ShipmentEvent[];
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
  carrierId?: EntityId;
  status?: ShipmentStatus;
  orderId?: EntityId;
  dateFrom?: string;
  dateTo?: string;
}

export interface CreateShipmentRequest {
  orderId: EntityId;
  useManualCarrier?: boolean;
  carrierId?: EntityId | null;
  carrier?: string | null;
  trackingNumber: string | null;
  estimatedDeliveryDate: string | null;
  shippingFee?: number | null;
  estimatedCarrierCost?: number | null;
  overrideReasonCode?: CarrierOverrideReason | null;
  overrideNote?: string | null;
  note: string | null;
}

export interface UpdateShipmentRequest {
  carrierId?: EntityId | null;
  carrier?: string | null;
  trackingNumber?: string | null;
  estimatedDeliveryDate?: string | null;
  shippingFee?: number | null;
  carrierCost?: number | null;
  estimatedCarrierCost?: number | null;
  note?: string | null;
}

export interface UpdateShipmentStatusRequest {
  status: ShipmentStatus;
  description?: string;
  location?: string;
  eventTime?: string;
}

export interface CancelShipmentProviderRequest {
  reason: string;
}
