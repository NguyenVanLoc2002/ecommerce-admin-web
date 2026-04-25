import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/constants/queryKeys';
import { voucherService } from '../services/voucherService';
import type { UpdateVoucherRequest } from '../types/voucher.types';

export function useUpdateVoucher(id: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: UpdateVoucherRequest) => voucherService.update(id, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.vouchers.lists() });
      void queryClient.invalidateQueries({ queryKey: queryKeys.vouchers.detail(id) });
    },
  });
}
