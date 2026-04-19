import type { PaginationParams } from '@/shared/types/api.types';
import type { PaymentMethod, PaymentStatus } from '@/shared/types/enums';

export interface PaymentCustomer {
  id: number;
  fullName: string;
  email: string;
  phone: string;
}

export interface PaymentSummary {
  id: number;
  orderId: number;
  orderCode: string;
  customer: PaymentCustomer;
  method: PaymentMethod;
  status: PaymentStatus;
  amount: number;
  paidAt: string | null;
  transactionId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: number;
  orderId: number;
  orderCode: string;
  customer: PaymentCustomer;
  method: PaymentMethod;
  status: PaymentStatus;
  amount: number;
  paidAt: string | null;
  transactionId: string | null;
  failureReason: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentTransaction {
  id: number;
  paymentId: number;
  type: string;
  amount: number;
  status: string;
  gatewayRef: string | null;
  note: string | null;
  createdAt: string;
}

export interface PaymentListParams extends PaginationParams {
  keyword?: string;
  method?: string;
  status?: string;
  orderId?: number;
  fromDate?: string;
  toDate?: string;
}
