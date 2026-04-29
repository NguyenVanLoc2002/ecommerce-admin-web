import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/constants/queryKeys';
import { invoiceService } from '../services/invoiceService';
import type { InvoiceListParams } from '../types/invoice.types';

export function useInvoices(params: InvoiceListParams) {
  return useQuery({
    queryKey: queryKeys.invoices.list(params),
    queryFn: () => invoiceService.getList(params),
    staleTime: 30_000,
  });
}
