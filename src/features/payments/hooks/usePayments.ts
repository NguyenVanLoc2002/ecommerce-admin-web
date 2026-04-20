import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/constants/queryKeys';
import { paymentService } from '../services/paymentService';
import type { PaymentListParams } from '../types/payment.types';

export function usePayments(params: PaymentListParams) {
  return useQuery({
    queryKey: queryKeys.payments.list(params),
    queryFn: () => paymentService.getList(params),
    staleTime: 30_000,
  });
}
