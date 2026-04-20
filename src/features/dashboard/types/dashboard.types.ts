import type { OrderStatus, PaymentStatus, ReviewStatus } from '@/shared/types/enums';

export interface DashboardOrder {
  id: number;
  orderCode: string;
  customerName: string;
  customerEmail: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  totalAmount: number;
  createdAt: string;
}

export interface DashboardReview {
  id: number;
  productId: number;
  productName: string;
  rating: number;
  comment: string;
  customerName: string;
  status: ReviewStatus;
  createdAt: string;
}

export interface DashboardLowStockItem {
  variantId: number;
  variantName: string;
  sku: string;
  productName: string;
  warehouseId: number;
  warehouseName: string;
  onHand: number;
  reserved: number;
  available: number;
}

export interface DashboardPaymentSummary {
  totalCount: number;
}
