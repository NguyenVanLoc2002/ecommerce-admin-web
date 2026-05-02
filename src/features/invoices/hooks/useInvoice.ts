import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/constants/queryKeys';
import { invoiceService } from '../services/invoiceService';

export function useInvoice(id?: string) {
  return useQuery({
    queryKey: queryKeys.invoices.detail(id ?? ''),
    queryFn: () => invoiceService.getById(id ?? ''),
    staleTime: 60_000,
    enabled: Boolean(id),
  });
}
