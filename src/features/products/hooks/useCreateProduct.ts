import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/constants/queryKeys';
import { productService } from '../services/productService';

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: productService.create,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.products.lists() });
    },
  });
}
