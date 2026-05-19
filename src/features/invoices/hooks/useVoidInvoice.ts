import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/constants/queryKeys';
import { AppError } from '@/shared/types/api.types';
import { isConcurrencyErrorCode } from '@/shared/utils/adminPhase3Errors';
import { invoiceService } from '../services/invoiceService';
import type { Invoice } from '../types/invoice.types';

export function useVoidInvoice(invoiceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (note: string) =>
      invoiceService.updateStatus(invoiceId, { status: 'VOIDED', notes: note }),
    onSuccess: (invoice) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.invoices.detail(invoiceId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.invoices.lists() });
      void queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.orders.detail(invoice.orderId) });
    },
    onError: (error) => {
      if (!(error instanceof AppError) || !isConcurrencyErrorCode(error.code)) {
        return;
      }

      const currentInvoice = queryClient.getQueryData<Invoice>(queryKeys.invoices.detail(invoiceId));

      void queryClient.invalidateQueries({ queryKey: queryKeys.invoices.detail(invoiceId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.invoices.lists() });
      void queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });

      if (currentInvoice?.orderId) {
        void queryClient.invalidateQueries({ queryKey: queryKeys.orders.detail(currentInvoice.orderId) });
      }
    },
  });
}
