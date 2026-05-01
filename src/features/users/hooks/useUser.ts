import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/constants/queryKeys';
import { userService } from '../services/userService';

export function useUser(id?: string) {
  return useQuery({
    queryKey: queryKeys.users.detail(id ?? ''),
    queryFn: () => userService.getById(id ?? ''),
    staleTime: 60_000,
    enabled: Boolean(id),
  });
}
