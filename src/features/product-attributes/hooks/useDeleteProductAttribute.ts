import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/constants/queryKeys';
import { productAttributeService } from '../services/productAttributeService';

export function useDeleteProductAttribute() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => productAttributeService.remove(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.productAttributes.lists() });
      void queryClient.invalidateQueries({ queryKey: queryKeys.productAttributes.variantOptions() });
      void queryClient.invalidateQueries({ queryKey: queryKeys.variants.all });
    },
  });
}
