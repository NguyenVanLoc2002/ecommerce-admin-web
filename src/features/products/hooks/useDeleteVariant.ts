import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/constants/queryKeys';
import { variantService } from '../services/variantService';

export function useDeleteVariant(productId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variantId: number) => variantService.remove(productId, variantId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.variants.byProduct(productId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.products.detail(productId) });
    },
  });
}
