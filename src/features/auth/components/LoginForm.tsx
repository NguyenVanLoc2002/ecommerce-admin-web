import { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff } from 'lucide-react';
import { AppError } from '@/shared/types/api.types';
import { toast } from '@/shared/stores/uiStore';
import { Button } from '@/shared/components/ui/Button';
import { FormField } from '@/shared/components/form/FormField';
import { loginSchema, type LoginFormValues } from '../schemas/loginSchema';
import { useLogin } from '../hooks/useLogin';

interface LoginFormProps {
  onSuccess: () => void;
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const login = useLogin();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const rootError = form.formState.errors.root?.message;

  const onSubmit = (values: LoginFormValues) => {
    login.mutate(values, {
      onSuccess: onSuccess,
      onError: (error) => {
        if (error instanceof AppError) {
          switch (error.code) {
            case 'INVALID_CREDENTIALS':
              form.setError('root', { message: 'Invalid email or password.' });
              break;
            case 'ACCOUNT_DISABLED':
              toast.error('Your account has been disabled. Contact support.');
              break;
            default:
              toast.error(error.message || 'Something went wrong. Please try again.');
          }
        } else {
          toast.error('Something went wrong. Please try again.');
        }
      },
    });
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={(e) => void form.handleSubmit(onSubmit)(e)} noValidate className="space-y-5">
        <FormField
          name="email"
          label="Email address"
          type="email"
          placeholder="you@example.com"
          required
          disabled={login.isPending}
          autoComplete="email"
        />

        <FormField
          name="password"
          label="Password"
          type={showPassword ? 'text' : 'password'}
          placeholder="••••••••"
          required
          disabled={login.isPending}
          autoComplete="current-password"
          rightIcon={
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPassword((v) => !v)}
              className="pointer-events-auto text-gray-400 hover:text-gray-600"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          }
        />

        {rootError && (
          <p role="alert" className="text-sm text-danger-600 font-medium">
            {rootError}
          </p>
        )}

        <Button
          type="submit"
          className="w-full"
          isLoading={login.isPending}
          size="lg"
        >
          {login.isPending ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>
    </FormProvider>
  );
}
