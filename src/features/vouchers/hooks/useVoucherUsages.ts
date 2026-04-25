import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/constants/queryKeys';
import { voucherService } from '../services/voucherService';
import type { PaginationParams } from '@/shared/types/api.types';

export function useVoucherUsages(id: number, params: PaginationParams) {
  return useQuery({
    queryKey: queryKeys.vouchers.usages(id, params),
    queryFn: () => voucherService.getUsages(id, params),
    staleTime: 30_000,
    enabled: id > 0,
  });
}
