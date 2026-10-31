import type { PaginationParams, EntityId } from '@/shared/types/api.types';
import type {
  CarrierProviderType,
  OrderStatus,
  OrderPaymentStatus,
  PaymentMethod,
} from '@/shared/types/enums';

export interface OrderItem {
  id: EntityId;
  variantId: EntityId;
  productName: string;
  variantName: string;
  sku: string;
  imageUrl?: string | null;
  thumbnailUrl?: string | null;
  productImageUrl?: string | null;
  variantImageUrl?: string | null;
  productPrimaryImageUrl?: string | null;
  variantPrimaryImageUrl?: string | null;
  productMedias?: OrderItemMedia[];
  variantMedias?: OrderItemMedia[];
  unitPrice: number;
  salePrice?: number | null;
  quantity: number;
  lineTotal: number;
  discountAmount: number;
}

export interface OrderItemMedia {
  id?: EntityId;
  mediaUrl: string;
  mediaType?: string;
  sortOrder?: number;
  primary?: boolean;
  variantId?: EntityId | null;
}

export interface Order {
  id: EntityId;
  orderCode: string;
  customerId: EntityId;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: OrderPaymentStatus | null;
  receiverName: string;
  receiverPhone: string;
  shippingStreet: string;
  shippingWard: string;
  shippingDistrict: string;
  shippingCity: string;
  shippingPostalCode: string | null;
  carrierId: EntityId | null;
  carrierCode: string | null;
  carrierName: string | null;
  carrierProviderType: CarrierProviderType | null;
  subTotal: number;
  discountAmount: number;
  shippingFee: number;
  totalAmount: number;
  voucherCode: string | null;
  customerNote: string | null;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface OrderSummary {
  id: EntityId;
  orderCode: string;
  customerId: EntityId;
  status: OrderStatus;
  paymentStatus: OrderPaymentStatus | null;
  paymentMethod: PaymentMethod | null;
  totalAmount: number;
  createdAt: string;
}

export interface OrderListParams extends PaginationParams {
  customerId?: EntityId;
  status?: OrderStatus;
  paymentStatus?: OrderPaymentStatus;
}

export type OrderAction = 'confirm' | 'process' | 'deliver' | 'complete' | 'cancel';
