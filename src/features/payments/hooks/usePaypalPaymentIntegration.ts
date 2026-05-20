import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/constants/queryKeys';
import { paymentService } from '../services/paymentService';

export function usePaypalPaymentIntegration() {
  return useQuery({
    queryKey: queryKeys.payments.paypalIntegration(),
    queryFn: () => paymentService.getPaypalIntegration(),
    staleTime: 60_000,
  });
}
