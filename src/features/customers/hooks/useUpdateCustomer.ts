import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/constants/queryKeys';
import { customerService } from '../services/customerService';
import type { UpdateCustomerRequest } from '../types/customer.types';

export function useUpdateCustomer(customerId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: UpdateCustomerRequest) =>
      customerService.update(customerId ?? '', body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.customers.lists() });
      if (customerId) {
        void queryClient.invalidateQueries({
          queryKey: queryKeys.customers.detail(customerId),
        });
      }
    },
  });
}
