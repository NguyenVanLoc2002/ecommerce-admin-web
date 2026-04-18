import { useFormContext, Controller } from 'react-hook-form';
import { cn } from '@/shared/utils/cn';
import { Input } from '@/shared/components/ui/Input';
import { Textarea } from '@/shared/components/ui/Textarea';

interface FormFieldProps {
  name: string;
  label?: string;
  required?: boolean;
  hint?: string;
  placeholder?: string;
  type?: React.InputHTMLAttributes<HTMLInputElement>['type'];
  multiline?: boolean;
  rows?: number;
  disabled?: boolean;
  className?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  autoComplete?: string;
  children?: React.ReactNode;
}

export function FormField({
  name,
  label,
  required,
  hint,
  placeholder,
  type = 'text',
  multiline,
  rows = 3,
  disabled,
  className,
  leftIcon,
  rightIcon,
  autoComplete,
  children,
}: FormFieldProps) {
  const {
    control,
    formState: { errors },
  } = useFormContext();

  const error = errors[name];
  const errorMessage = error?.message as string | undefined;

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && (
        <label htmlFor={name} className="text-sm font-medium text-gray-700">
          {label}
          {required && <span className="ml-0.5 text-danger-500">*</span>}
        </label>
      )}
      <Controller
        control={control}
        name={name}
        render={({ field }) => {
          if (children) {
            return <>{children}</>;
          }
          if (multiline) {
            return (
              <Textarea
                id={name}
                rows={rows}
                placeholder={placeholder}
                disabled={disabled}
                error={!!errorMessage}
                {...field}
                value={field.value as string ?? ''}
              />
            );
          }
          return (
            <Input
              id={name}
              type={type}
              placeholder={placeholder}
              disabled={disabled}
              error={!!errorMessage}
              leftIcon={leftIcon}
              rightIcon={rightIcon}
              autoComplete={autoComplete}
              {...field}
              value={field.value as string ?? ''}
            />
          );
        }}
      />
      {hint && !errorMessage && <p className="text-xs text-gray-500">{hint}</p>}
      {errorMessage && <p className="text-xs text-danger-600">{errorMessage}</p>}
    </div>
  );
}
