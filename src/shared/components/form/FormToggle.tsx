import { useFormContext, Controller } from 'react-hook-form';
import { cn } from '@/shared/utils/cn';
import { Toggle } from '@/shared/components/ui/Toggle';

interface FormToggleProps {
  name: string;
  label?: string;
  hint?: string;
  disabled?: boolean;
  className?: string;
}

export function FormToggle({ name, label, hint, disabled, className }: FormToggleProps) {
  const { control } = useFormContext();

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <Toggle
            checked={field.value as boolean}
            onChange={field.onChange}
            disabled={disabled}
            label={label}
          />
        )}
      />
      {hint && <p className="text-xs text-gray-500">{hint}</p>}
    </div>
  );
}
