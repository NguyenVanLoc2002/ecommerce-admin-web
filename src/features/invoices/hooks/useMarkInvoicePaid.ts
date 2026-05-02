import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/constants/queryKeys';
import { invoiceService } from '../services/invoiceService';

export function useMarkInvoicePaid(invoiceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => invoiceService.updateStatus(invoiceId, { status: 'PAID' }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.invoices.detail(invoiceId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
    },
  });
}
