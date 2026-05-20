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

export interface MomoPaymentIntegration {
  provider: 'MOMO' | string;
  managedInDatabase: boolean;
  enabled: boolean;
  environment: string | null;
  hasPartnerCode: boolean;
  hasAccessKey: boolean;
  hasSecretKey: boolean;
  createUrl: string | null;
  redirectUrl: string | null;
  ipnUrl: string | null;
  requestType: string | null;
  lang: string | null;
  connectTimeoutMs: number | null;
  readTimeoutMs: number | null;
}

export interface UpdateMomoPaymentIntegrationRequest {
  enabled?: boolean;
  environment?: string;
  partnerCode?: string;
  accessKey?: string;
  secretKey?: string;
  createUrl?: string;
  redirectUrl?: string;
  ipnUrl?: string;
  requestType?: string;
  lang?: string;
  connectTimeoutMs?: number | null;
  readTimeoutMs?: number | null;
}

export interface PaypalPaymentIntegration {
  provider: 'PAYPAL' | string;
  managedInDatabase: boolean;
  enabled: boolean;
  environment: string | null;
  hasClientId: boolean;
  hasClientSecret: boolean;
  baseUrl: string | null;
  returnUrl: string | null;
  cancelUrl: string | null;
  webhookId: string | null;
  currency: string | null;
  brandName: string | null;
  locale: string | null;
  userAction: string | null;
  paymentMethodPreference: string | null;
  shippingPreference: string | null;
  testConversionEnabled: boolean;
  testConversionRateVndToUsd: number | null;
  connectTimeoutMs: number | null;
  readTimeoutMs: number | null;
}

export interface UpdatePaypalPaymentIntegrationRequest {
  enabled?: boolean;
  environment?: string;
  clientId?: string;
  clientSecret?: string;
  baseUrl?: string;
  returnUrl?: string;
  cancelUrl?: string;
  webhookId?: string;
  currency?: string;
  brandName?: string;
  locale?: string;
  userAction?: string;
  paymentMethodPreference?: string;
  shippingPreference?: string;
  testConversionEnabled?: boolean;
  testConversionRateVndToUsd?: number | null;
  connectTimeoutMs?: number | null;
  readTimeoutMs?: number | null;
}
