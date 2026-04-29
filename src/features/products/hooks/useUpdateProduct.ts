import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/constants/queryKeys';
import { productService } from '../services/productService';
import type { UpdateProductRequest } from '../types/product.types';

export function useUpdateProduct(productId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: UpdateProductRequest) => productService.update(productId ?? '', body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.products.detail(productId ?? '') });
      void queryClient.invalidateQueries({ queryKey: queryKeys.products.lists() });
    },
  });
}
