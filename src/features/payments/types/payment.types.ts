import type { PaginationParams, EntityId } from '@/shared/types/api.types';
import type { PaymentMethod, PaymentStatus } from '@/shared/types/enums';

export interface PaymentCustomer {
  id: EntityId;
  fullName: string;
  email: string;
  phone: string;
}

export interface PaymentSummary {
  id: EntityId;
  orderId: EntityId;
  orderCode: string;
  paymentCode: string;
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
  id: EntityId;
  orderId: EntityId;
  orderCode: string;
  paymentCode: string;
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
  id: EntityId;
  paymentId: EntityId;
  type: string;
  amount: number;
  status: string;
  gatewayRef: string | null;
  note: string | null;
  createdAt: string;
}

export interface PaymentListParams extends PaginationParams {
  orderCode?: string;
  method?: PaymentMethod;
  status?: PaymentStatus;
  dateFrom?: string;
  dateTo?: string;
}
