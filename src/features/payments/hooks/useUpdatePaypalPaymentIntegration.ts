import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/constants/queryKeys';
import { paymentService } from '../services/paymentService';
import type { UpdatePaypalPaymentIntegrationRequest } from '../types/payment.types';

export function useUpdatePaypalPaymentIntegration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: UpdatePaypalPaymentIntegrationRequest) =>
      paymentService.updatePaypalIntegration(body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.payments.paypalIntegration() });
    },
  });
}
