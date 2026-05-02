import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/constants/queryKeys';
import { voucherService } from '../services/voucherService';
import type { PaginationParams } from '@/shared/types/api.types';

export function useVoucherUsages(id?: string, params?: PaginationParams) {
  return useQuery({
    queryKey: queryKeys.vouchers.usages(id ?? '', params ?? { page: 0, size: 20 }),
    queryFn: () => voucherService.getUsages(id ?? '', params ?? { page: 0, size: 20 }),
    staleTime: 30_000,
    enabled: Boolean(id),
  });
}
