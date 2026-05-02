import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/constants/queryKeys';
import { voucherService } from '../services/voucherService';
import type { VoucherListParams } from '../types/voucher.types';

export function useVouchers(params: VoucherListParams) {
  return useQuery({
    queryKey: queryKeys.vouchers.list(params),
    queryFn: () => voucherService.getList(params),
    staleTime: 30_000,
  });
}
