import type { PaginationParams } from '@/shared/types/api.types';
import type {
  OrderStatus,
  PaymentStatus,
  PaymentMethod,
} from '@/shared/types/enums';

export interface OrderItem {
  id: number;
  variantId: number;
  productName: string;
  variantName: string;
  sku: string;
  imageUrl?: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  discountAmount: number;
}

export interface Order {
  id: number;
  orderCode: string;
  customerId: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus | null;
  receiverName: string;
  receiverPhone: string;
  shippingStreet: string;
  shippingWard: string;
  shippingDistrict: string;
  shippingCity: string;
  shippingPostalCode: string | null;
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
  id: number;
  orderCode: string;
  customerId: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus | null;
  paymentMethod: PaymentMethod | null;
  totalAmount: number;
  createdAt: string;
}

export interface OrderListParams extends PaginationParams {
  customerId?: number;
  status?: string;
  paymentStatus?: string;
  keyword?: string;
}

export type OrderAction = 'confirm' | 'process' | 'deliver' | 'complete' | 'cancel';
