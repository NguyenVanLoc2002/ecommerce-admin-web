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

export type ReturnDecision = 'approve' | 'reject';

export function decideOrderReturn(entry: OrderReturn, action: ReturnDecision, reason: string, key: string) {
  return apiClient.post<OrderReturn>(`/admin/orders/${entry.orderId}/returns/${entry.id}/${action}`, { reason }, {
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
  refund: { paymentId: string; refundCode: string; status: string; amount: number } | null;
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
