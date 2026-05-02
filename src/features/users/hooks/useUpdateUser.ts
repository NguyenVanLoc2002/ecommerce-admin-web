import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/constants/queryKeys';
import { userService } from '../services/userService';
import type { UpdateUserRequest } from '../types/user.types';

export function useUpdateUser(userId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: UpdateUserRequest) => userService.update(userId ?? '', body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() });
      if (userId) {
        void queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(userId) });
      }
    },
  });
}
