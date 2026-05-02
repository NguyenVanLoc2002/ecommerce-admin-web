import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/constants/queryKeys';
import { invoiceService } from '../services/invoiceService';

export function useVoidInvoice(invoiceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (note: string) =>
      invoiceService.updateStatus(invoiceId, { status: 'VOIDED', notes: note }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.invoices.detail(invoiceId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
    },
  });
}
