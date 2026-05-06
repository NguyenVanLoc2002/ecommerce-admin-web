import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { routes } from '@/constants/routes';
import { clearClientAuthState } from '@/shared/lib/authSession';
import { authService } from '@/shared/services/authService';

export function useLogout() {
  const navigate = useNavigate();

  return useCallback(() => {
    void authService.logout().catch(() => undefined);
    clearClientAuthState();
    navigate(routes.login, { replace: true });
  }, [navigate]);
}
