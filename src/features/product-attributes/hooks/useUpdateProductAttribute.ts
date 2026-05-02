import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/constants/queryKeys';
import { productAttributeService } from '../services/productAttributeService';
import type { UpdateProductAttributeRequest } from '../types/productAttribute.types';

export function useUpdateProductAttribute() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateProductAttributeRequest }) =>
      productAttributeService.update(id, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.productAttributes.lists() });
      void queryClient.invalidateQueries({ queryKey: queryKeys.productAttributes.variantOptions() });
      void queryClient.invalidateQueries({ queryKey: queryKeys.variants.all });
    },
  });
}
