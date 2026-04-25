import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/constants/queryKeys';
import { voucherService } from '../services/voucherService';

export function useVoucher(id: number) {
  return useQuery({
    queryKey: queryKeys.vouchers.detail(id),
    queryFn: () => voucherService.getById(id),
    staleTime: 60_000,
    enabled: id > 0,
  });
}
