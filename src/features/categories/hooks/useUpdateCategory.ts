import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/constants/queryKeys';
import { categoryService } from '../services/categoryService';
import type { UpdateCategoryRequest } from '../types/category.types';

export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: UpdateCategoryRequest }) =>
      categoryService.update(id, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.categories.lists() });
      void queryClient.invalidateQueries({ queryKey: ['catalog', 'categories'] });
    },
  });
}
