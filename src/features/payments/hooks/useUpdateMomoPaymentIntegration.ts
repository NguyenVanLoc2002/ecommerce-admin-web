import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/constants/queryKeys';
import { paymentService } from '../services/paymentService';
import type { UpdateMomoPaymentIntegrationRequest } from '../types/payment.types';

export function useUpdateMomoPaymentIntegration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: UpdateMomoPaymentIntegrationRequest) =>
      paymentService.updateMomoIntegration(body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.payments.momoIntegration() });
    },
  });
}
