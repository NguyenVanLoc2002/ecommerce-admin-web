import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/constants/queryKeys';
import { paymentService } from '../services/paymentService';

export function useMomoPaymentIntegration() {
  return useQuery({
    queryKey: queryKeys.payments.momoIntegration(),
    queryFn: () => paymentService.getMomoIntegration(),
    staleTime: 60_000,
  });
}
