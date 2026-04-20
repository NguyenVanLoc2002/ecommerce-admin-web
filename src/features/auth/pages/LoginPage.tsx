import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import { useAuthStore } from '@/shared/stores/authStore';
import { routes } from '@/constants/routes';
import { LoginForm } from '../components/LoginForm';

export function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const accessToken = useAuthStore((s) => s.accessToken);

  // Redirect users who are already authenticated (e.g., direct URL visit or
  // page refresh on /login while a valid session exists in localStorage).
  useEffect(() => {
    if (accessToken) {
      const redirect = searchParams.get('redirect');
      navigate(redirect ?? routes.dashboard, { replace: true });
    }
  }, [accessToken, navigate, searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="mb-8 flex flex-col items-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-600">
            <ShoppingBag className="h-6 w-6 text-white" aria-hidden />
          </div>
          <h1 className="mt-4 text-2xl font-bold text-gray-900">Fashion Shop Admin</h1>
          <p className="mt-1 text-sm text-gray-500">Sign in to your account to continue</p>
        </div>

        {/* Card */}
        <div className="rounded-xl bg-white px-8 py-8 shadow-sm ring-1 ring-gray-200">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
