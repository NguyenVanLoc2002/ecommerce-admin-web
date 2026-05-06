import { useEffect, type ReactNode } from 'react';
import { clearClientAuthState, purgeLegacyAuthStorage } from '@/shared/lib/authSession';
import { authService } from '@/shared/services/authService';
import { useAuthStore } from '@/shared/stores/authStore';

interface AuthProviderProps {
  children: ReactNode;
}

let hasStartedAuthBootstrap = false;

export function AuthProvider({ children }: AuthProviderProps) {
  const isAuthResolved = useAuthStore((state) => state.isAuthResolved);
  const setSession = useAuthStore((state) => state.setSession);
  const setAuthResolved = useAuthStore((state) => state.setAuthResolved);

  useEffect(() => {
    if (hasStartedAuthBootstrap) {
      return;
    }

    hasStartedAuthBootstrap = true;
    setAuthResolved(false);

    void (async () => {
      purgeLegacyAuthStorage();

      try {
        const session = await authService.refreshToken();
        setSession(session);
      } catch {
        clearClientAuthState();
      } finally {
        setAuthResolved(true);
      }
    })();
  }, [setAuthResolved, setSession]);

  if (!isAuthResolved) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-gray-200 border-t-primary-600" />
          <p className="mt-4 text-sm text-gray-600">Restoring admin session...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
