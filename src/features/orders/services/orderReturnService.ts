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
