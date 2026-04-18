import { useFormContext, Controller } from 'react-hook-form';
import { cn } from '@/shared/utils/cn';
import { Select, type SelectOption } from '@/shared/components/ui/Select';

interface FormSelectProps {
  name: string;
  label?: string;
  required?: boolean;
  hint?: string;
  placeholder?: string;
  options: SelectOption[];
  disabled?: boolean;
  className?: string;
}

export function FormSelect({
  name,
  label,
  required,
  hint,
  placeholder,
  options,
  disabled,
  className,
}: FormSelectProps) {
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
        render={({ field }) => (
          <Select
            id={name}
            options={options}
            placeholder={placeholder}
            disabled={disabled}
            error={!!errorMessage}
            {...field}
            value={field.value as string ?? ''}
          />
        )}
      />
      {hint && !errorMessage && <p className="text-xs text-gray-500">{hint}</p>}
      {errorMessage && <p className="text-xs text-danger-600">{errorMessage}</p>}
    </div>
  );
}
