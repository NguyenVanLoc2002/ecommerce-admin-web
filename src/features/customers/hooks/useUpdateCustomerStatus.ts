import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/constants/queryKeys';
import { customerService } from '../services/customerService';
import type { UpdateCustomerStatusRequest } from '../types/customer.types';

interface UpdateCustomerStatusVariables {
  id: string;
  body: UpdateCustomerStatusRequest;
}

export function useUpdateCustomerStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, body }: UpdateCustomerStatusVariables) =>
      customerService.updateStatus(id, body),
    onSuccess: (_data, { id }) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.customers.lists() });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.customers.detail(id),
      });
    },
  });
}
