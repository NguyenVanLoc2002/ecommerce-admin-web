import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { routes } from '@/constants/routes';
import { clearClientAuthState } from '@/shared/lib/authSession';
import { authService } from '@/shared/services/authService';

export function useLogout() {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: () => authService.logout(),
    onSettled: () => {
      clearClientAuthState();
      navigate(routes.login, { replace: true });
    },
  });
}
