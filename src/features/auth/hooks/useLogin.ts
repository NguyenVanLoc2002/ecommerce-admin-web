import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '@/shared/stores/authStore';
import { authService } from '../services/authService';
import type { LoginRequest } from '@/shared/types/auth.types';

export function useLogin() {
  const setTokens = useAuthStore((s) => s.setTokens);
  const setUser = useAuthStore((s) => s.setUser);

  return useMutation({
    mutationFn: (request: LoginRequest) => authService.login(request),
    onSuccess: (data) => {
      setTokens(data.tokens);
      setUser(data.user);
    },
  });
}
