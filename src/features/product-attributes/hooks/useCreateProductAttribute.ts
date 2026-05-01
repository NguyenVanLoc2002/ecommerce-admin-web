import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/constants/queryKeys';
import { productAttributeService } from '../services/productAttributeService';

export function useCreateProductAttribute() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: productAttributeService.create,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.productAttributes.lists() });
      void queryClient.invalidateQueries({ queryKey: queryKeys.productAttributes.variantOptions() });
    },
  });
}
