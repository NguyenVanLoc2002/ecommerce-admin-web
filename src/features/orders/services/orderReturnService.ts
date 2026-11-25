import { apiClient } from '@/shared/lib/axios';
import type { PaginatedResponse } from '@/shared/types/api.types';

export const returnStatuses = [
  'PENDING_DELIVERY_VERIFICATION', 'REQUESTED', 'APPROVED', 'RECEIVED',
  'INSPECTED', 'COMPLETED', 'REJECTED', 'CANCELLED',
] as const;

export type ReturnStatus = (typeof returnStatuses)[number];

export interface OrderReturn {
  id: string;
  orderId: string;
  status: ReturnStatus;
  reason: string;
  note: string;
  createdAt: string;
  items: { orderItemId: string; quantity: number }[];
}

export type ReturnDecision = 'approve' | 'reject' | 'verify-delivery';

export function decideOrderReturn(entry: OrderReturn, action: ReturnDecision, reason: string, key: string, deliveredAt?: string) {
  return apiClient.post<OrderReturn>(`/admin/orders/${entry.orderId}/returns/${entry.id}/${action}`, { reason, ...(deliveredAt ? { deliveredAt } : {}) }, {
    headers: { 'Idempotency-Key': key },
  });
}

export function listOrderReturns(params: { orderId?: string; status?: ReturnStatus; page: number }) {
  return apiClient.get<PaginatedResponse<OrderReturn>>('/admin/returns', { params });
}

export interface ReturnHandlingLine {
  orderItemId: string;
  quantity: number;
  restock: number;
  damaged: number;
}

export interface ReturnHandling {
  note: string;
  carrier?: string;
  trackingNumber?: string;
  items: ReturnHandlingLine[];
}

export interface ReturnDetail {
  request: OrderReturn;
  receipt: ReturnHandling | null;
  inspection: ReturnHandling | null;
  exchanges?: ReturnExchange[];
  refund: ReturnRefund | null;
}

export interface ReturnRefund {
  paymentId: string;
  refundCode: string;
  status: string;
  amount: number;
  paymentMethod?: string;
  settlementReference?: string | null;
  settlementSubmittedBy?: string | null;
}

export type RefundSettlement =
  | { action: 'paypal/verify' | 'cod/evidence'; reference: string }
  | { action: 'cod/confirm' };

export function settleReturnRefund(entry: OrderReturn, operation: RefundSettlement) {
  return apiClient.post<ReturnRefund>(`/admin/orders/${entry.orderId}/returns/${entry.id}/refund/${operation.action}`,
    'reference' in operation ? { reference: operation.reference } : undefined);
}

export interface ReturnExchange {
  id: string;
  orderItemId: string;
  variantId: string;
  quantity: number;
  status: 'PRICE_REVIEW_REQUIRED' | 'DIFFERENT_PRICE' | 'WAITING_CUSTOMER_CHOICE' | 'RESERVED' | 'HOLD_EXPIRED' | 'REPLACEMENT_CREATED' | 'CANCELLED';
  expiresAt: string | null;
  replacementOrderId: string | null;
}

export interface ExchangeSelection {
  orderItemId: string;
  variantId: string;
  warehouseId: string;
  quantity: number;
  historicalPriceEvidence?: string;
}

export type ExchangeOperation =
  | { action: 'reserve'; selection: ExchangeSelection; key: string }
  | { action: 'cancel' | 'replacement'; exchangeId: string };

export function submitReturnExchange(entry: OrderReturn, operation: ExchangeOperation) {
  const path = `/admin/orders/${entry.orderId}/returns/${entry.id}/exchanges`;
  if (operation.action === 'reserve') {
    return apiClient.post<ReturnExchange>(path, operation.selection, { headers: { 'Idempotency-Key': operation.key } });
  }
  return apiClient.post<ReturnExchange>(`${path}/${operation.exchangeId}/${operation.action}`);
}

export interface ReturnHandlingRequest extends ReturnHandling {
  warehouseId?: string;
}

export function getReturnDetail(entry: OrderReturn) {
  return apiClient.get<ReturnDetail>(`/admin/returns/${entry.orderId}/${entry.id}`);
}

export function submitReturnHandling(
  entry: OrderReturn, action: 'receive' | 'inspect' | 'refund', body: ReturnHandlingRequest | undefined, key: string,
) {
  return apiClient.post(`/admin/orders/${entry.orderId}/returns/${entry.id}/${action}`, body, {
    headers: { 'Idempotency-Key': key },
  });
}
