import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/constants/queryKeys';
import { userService } from '../services/userService';
import type { CreateUserRequest } from '../types/user.types';

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateUserRequest) => userService.create(body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() });
    },
  });
}
