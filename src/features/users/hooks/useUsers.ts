import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/constants/queryKeys';
import { userService } from '../services/userService';
import type { AdminUserListParams } from '../types/user.types';

export function useUsers(params: AdminUserListParams) {
  return useQuery({
    queryKey: queryKeys.users.list(params),
    queryFn: () => userService.getList(params),
    staleTime: 30_000,
  });
}
