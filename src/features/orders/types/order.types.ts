import type { PaginationParams } from '@/shared/types/api.types';
import type {
  OrderStatus,
  PaymentStatus,
  PaymentMethod,
  ShipmentStatus,
} from '@/shared/types/enums';

export interface OrderCustomer {
  id: number;
  fullName: string;
  email: string;
  phone: string;
}

export interface OrderAddress {
  fullName: string;
  phone: string;
  street: string;
  ward: string;
  district: string;
  province: string;
}

export interface OrderItem {
  id: number;
  variantId: number;
  productName: string;
  variantSku: string;
  variantName: string;
  imageUrl: string | null;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  discount: number;
  total: number;
}

export interface OrderPayment {
  id: number;
  method: PaymentMethod;
  status: PaymentStatus;
  amount: number;
  paidAt: string | null;
  transactionId: string | null;
}

export interface OrderShipment {
  id: number;
  trackingCode: string | null;
  carrier: string | null;
  status: ShipmentStatus;
  estimatedDelivery: string | null;
  shippedAt: string | null;
  deliveredAt: string | null;
}

export interface Order {
  id: number;
  code: string;
  customer: OrderCustomer;
  status: OrderStatus;
  shippingAddress: OrderAddress;
  items: OrderItem[];
  payment: OrderPayment | null;
  shipment: OrderShipment | null;
  subtotal: number;
  discountAmount: number;
  shippingFee: number;
  total: number;
  note: string | null;
  voucherCode: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface OrderSummary {
  id: number;
  code: string;
  customer: {
    fullName: string;
    email: string;
    phone: string;
  };
  status: OrderStatus;
  paymentStatus: PaymentStatus | null;
  paymentMethod: PaymentMethod | null;
  itemCount: number;
  total: number;
  createdAt: string;
}

export interface OrderListParams extends PaginationParams {
  keyword?: string;
  status?: string;
  paymentMethod?: string;
  fromDate?: string;
  toDate?: string;
}

export interface UpdateOrderStatusRequest {
  status: OrderStatus;
  note?: string;
}
