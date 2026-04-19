import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/constants/queryKeys';
import { productService } from '../services/productService';
import type { ProductStatus } from '@/shared/types/enums';

interface BulkStatusUpdate {
  ids: number[];
  status: ProductStatus;
}

export function useBulkUpdateProductStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ ids, status }: BulkStatusUpdate) => {
      const results = await Promise.allSettled(
        ids.map((id) => productService.updateStatus(id, status)),
      );
      const failed = results.filter((r) => r.status === 'rejected').length;
      return { total: ids.length, failed, succeeded: ids.length - failed };
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.products.lists() });
    },
  });
}

export function useBulkDeleteProducts() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ids: number[]) => {
      const results = await Promise.allSettled(ids.map((id) => productService.remove(id)));
      const failed = results.filter((r) => r.status === 'rejected').length;
      return { total: ids.length, failed, succeeded: ids.length - failed };
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.products.lists() });
    },
  });
}
