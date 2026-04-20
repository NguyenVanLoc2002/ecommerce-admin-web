import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/constants/queryKeys';
import { brandService } from '../services/brandService';
import type { UpdateBrandRequest } from '../types/brand.types';

export function useUpdateBrand() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: UpdateBrandRequest }) =>
      brandService.update(id, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.brands.lists() });
      void queryClient.invalidateQueries({ queryKey: ['catalog', 'brands'] });
    },
  });
}
