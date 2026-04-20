import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/constants/queryKeys';
import { categoryService } from '../services/categoryService';
import type { CategoryListParams } from '../types/category.types';

export function useCategories(params: CategoryListParams) {
  return useQuery({
    queryKey: queryKeys.categories.list(params),
    queryFn: () => categoryService.getList(params),
    staleTime: 30_000,
  });
}
