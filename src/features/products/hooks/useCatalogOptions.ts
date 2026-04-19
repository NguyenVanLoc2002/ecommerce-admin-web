import { useQuery } from '@tanstack/react-query';
import { catalogService } from '../services/catalogService';

export function useCategoryOptions() {
  return useQuery({
    queryKey: ['catalog', 'categories'],
    queryFn: () => catalogService.getCategories(),
    staleTime: 5 * 60_000,
    retry: 1,
  });
}

export function useBrandOptions() {
  return useQuery({
    queryKey: ['catalog', 'brands'],
    queryFn: () => catalogService.getBrands(),
    staleTime: 5 * 60_000,
    retry: 1,
  });
}
