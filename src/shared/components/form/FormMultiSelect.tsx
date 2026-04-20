import { useFormContext, Controller } from 'react-hook-form';
import { cn } from '@/shared/utils/cn';
import { MultiSelectDropdown, type MultiSelectOption } from '@/shared/components/ui/MultiSelectDropdown';

interface FormMultiSelectProps {
  name: string;
  label?: string;
  required?: boolean;
  hint?: string;
  placeholder?: string;
  options: MultiSelectOption[];
  disabled?: boolean;
  className?: string;
}

export function FormMultiSelect({
  name,
  label,
  required,
  hint,
  placeholder,
  options,
  disabled,
  className,
}: FormMultiSelectProps) {
  const {
    control,
    formState: { errors },
  } = useFormContext();

  const error = errors[name];
  const errorMessage = error?.message as string | undefined;

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && (
        <label className="text-sm font-medium text-gray-700">
          {label}
          {required && <span className="ml-0.5 text-danger-500">*</span>}
        </label>
      )}
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <MultiSelectDropdown
            options={options}
            value={(field.value as (number | string)[]) ?? []}
            onChange={field.onChange}
            placeholder={placeholder}
            disabled={disabled}
            error={!!errorMessage}
          />
        )}
      />
      {hint && !errorMessage && <p className="text-xs text-gray-500">{hint}</p>}
      {errorMessage && <p className="text-xs text-danger-600">{errorMessage}</p>}
    </div>
  );
}
