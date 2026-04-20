import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/constants/queryKeys';
import { brandService } from '../services/brandService';

export function useCreateBrand() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: brandService.create,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.brands.lists() });
      void queryClient.invalidateQueries({ queryKey: ['catalog', 'brands'] });
    },
  });
}
