import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/constants/queryKeys';
import { voucherService } from '../services/voucherService';

export function useCreateVoucher() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: voucherService.create,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.vouchers.lists() });
    },
  });
}
