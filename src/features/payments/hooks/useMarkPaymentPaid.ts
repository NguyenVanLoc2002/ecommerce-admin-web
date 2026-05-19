import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/constants/queryKeys';
import { AppError } from '@/shared/types/api.types';
import { isConcurrencyErrorCode } from '@/shared/utils/adminPhase3Errors';
import { paymentService } from '../services/paymentService';

export function useMarkPaymentPaid(paymentId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderId: string) => paymentService.completeCod(orderId),
    onSuccess: (_payment, orderId) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.payments.lists() });
      if (paymentId) {
        void queryClient.invalidateQueries({ queryKey: queryKeys.payments.detail(paymentId) });
        void queryClient.invalidateQueries({ queryKey: queryKeys.payments.transactions(paymentId) });
      }
      void queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.orders.detail(orderId) });
    },
    onError: (error) => {
      if (!(error instanceof AppError)) {
        return;
      }

      if (error.code === 'PAYMENT_ALREADY_PROCESSED' || isConcurrencyErrorCode(error.code)) {
        void queryClient.invalidateQueries({ queryKey: queryKeys.payments.all });
        void queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
        if (paymentId) {
          void queryClient.invalidateQueries({ queryKey: queryKeys.payments.detail(paymentId) });
          void queryClient.invalidateQueries({ queryKey: queryKeys.payments.transactions(paymentId) });
        }
      }
    },
  });
}
