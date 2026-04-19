import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/constants/queryKeys';
import { variantService } from '../services/variantService';
import type { CreateVariantRequest } from '../types/product.types';

export function useCreateVariant(productId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateVariantRequest) => variantService.create(productId, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.variants.byProduct(productId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.products.detail(productId) });
    },
  });
}
