import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/constants/queryKeys';
import { paymentService } from '../services/paymentService';

export function useMarkPaymentPaid() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderId: string) => paymentService.completeCod(orderId),
    onSuccess: (_data, orderId) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.payments.lists() });
      void queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.orders.detail(orderId) });
    },
  });
}
