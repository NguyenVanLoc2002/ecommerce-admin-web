import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/constants/queryKeys';
import { categoryService } from '../services/categoryService';

export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: categoryService.create,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.categories.lists() });
      void queryClient.invalidateQueries({ queryKey: ['catalog', 'categories'] });
    },
  });
}
