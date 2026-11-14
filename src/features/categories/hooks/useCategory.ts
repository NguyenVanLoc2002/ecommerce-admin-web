import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/constants/queryKeys';
import { categoryService } from '../services/categoryService';

export function useCategory(id?: string) {
  return useQuery({
    queryKey: queryKeys.categories.detail(id ?? ''),
    queryFn: () => categoryService.getById(id ?? ''),
    staleTime: 60_000,
    enabled: Boolean(id),
  });
}
