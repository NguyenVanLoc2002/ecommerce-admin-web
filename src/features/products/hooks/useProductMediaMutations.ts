import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/constants/queryKeys';
import type { EntityId } from '@/shared/types/api.types';
import { productService } from '../services/productService';
import type { CreateProductMediaRequest, UpdateProductMediaRequest } from '../types/product.types';

function useInvalidateProductMedia(productId: EntityId) {
  const queryClient = useQueryClient();

  return () => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.products.detail(productId) });
    void queryClient.invalidateQueries({ queryKey: queryKeys.products.lists() });
  };
}

export function useCreateProductMedia(productId: EntityId) {
  const invalidate = useInvalidateProductMedia(productId);

  return useMutation({
    mutationFn: (body: CreateProductMediaRequest) => productService.createMedia(productId, body),
    onSuccess: invalidate,
  });
}

export function useUpdateProductMedia(productId: EntityId) {
  const invalidate = useInvalidateProductMedia(productId);

  return useMutation({
    mutationFn: ({ mediaId, body }: { mediaId: EntityId; body: UpdateProductMediaRequest }) =>
      productService.updateMedia(productId, mediaId, body),
    onSuccess: invalidate,
  });
}

export function useDeleteProductMedia(productId: EntityId) {
  const invalidate = useInvalidateProductMedia(productId);

  return useMutation({
    mutationFn: (mediaId: EntityId) => productService.removeMedia(productId, mediaId),
    onSuccess: invalidate,
  });
}
