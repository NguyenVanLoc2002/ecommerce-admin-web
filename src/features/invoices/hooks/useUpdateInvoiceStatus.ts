import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/constants/queryKeys';
import { invoiceService } from '../services/invoiceService';
import type { UpdateInvoiceStatusRequest } from '../types/invoice.types';

export function useUpdateInvoiceStatus(invoiceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: UpdateInvoiceStatusRequest) => invoiceService.updateStatus(invoiceId, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.invoices.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
    },
  });
}
