import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '@/shared/stores/authStore';
import { authService } from '../services/authService';
import type { LoginRequest } from '@/shared/types/auth.types';

export function useLogin() {
  const setSession = useAuthStore((s) => s.setSession);

  return useMutation({
    mutationFn: (request: LoginRequest) => authService.login(request),
    onSuccess: (data) => {
      setSession(data);
    },
  });
}
