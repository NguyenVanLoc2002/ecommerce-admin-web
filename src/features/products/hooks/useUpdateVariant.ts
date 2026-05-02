import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/constants/queryKeys';
import { variantService } from '../services/variantService';
import type { UpdateVariantRequest } from '../types/product.types';

export function useUpdateVariant(productId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ variantId, body }: { variantId: string; body: UpdateVariantRequest }) =>
      variantService.update(productId ?? '', variantId, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.variants.byProduct(productId ?? '') });
      void queryClient.invalidateQueries({ queryKey: queryKeys.products.detail(productId ?? '') });
    },
  });
}
