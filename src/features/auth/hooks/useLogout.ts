import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/shared/stores/authStore';
import { routes } from '@/constants/routes';
import { authService } from '../services/authService';

export function useLogout() {
  const clear = useAuthStore((s) => s.clear);
  const navigate = useNavigate();

  // Fire-and-forget: server invalidates the refresh token.
  // We clear local state immediately regardless of the server response so the
  // UX is instant and a server error never traps the user on the admin panel.
  return useCallback(() => {
    authService.logout().catch(() => undefined);
    clear();
    navigate(routes.login, { replace: true });
  }, [clear, navigate]);
}
