import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/constants/queryKeys';
import { paymentService } from '../services/paymentService';

export function usePayment(id: number) {
  return useQuery({
    queryKey: queryKeys.payments.detail(id),
    queryFn: () => paymentService.getById(id),
    staleTime: 60_000,
    enabled: Number.isFinite(id) && id > 0,
  });
}
