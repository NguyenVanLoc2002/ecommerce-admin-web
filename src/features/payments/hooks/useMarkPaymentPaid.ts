import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/constants/queryKeys';
import { paymentService } from '../services/paymentService';

export function useMarkPaymentPaid(paymentId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => paymentService.markPaid(paymentId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.payments.detail(paymentId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.payments.lists() });
      void queryClient.invalidateQueries({ queryKey: queryKeys.payments.transactions(paymentId) });
      // Order payment status changes too
      void queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
    },
  });
}
