import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/constants/queryKeys';
import { paymentService } from '../services/paymentService';

export function usePaymentTransactions(paymentId: number) {
  return useQuery({
    queryKey: queryKeys.payments.transactions(paymentId),
    queryFn: () => paymentService.getTransactions(paymentId),
    staleTime: 60_000,
    enabled: Number.isFinite(paymentId) && paymentId > 0,
  });
}
