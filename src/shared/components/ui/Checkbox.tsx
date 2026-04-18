import { Check, Minus } from 'lucide-react';
import { forwardRef } from 'react';
import { cn } from '@/shared/utils/cn';

interface CheckboxProps {
  checked?: boolean;
  indeterminate?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  className?: string;
  id?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ checked = false, indeterminate = false, onChange, disabled, label, className, id }, ref) => {
    const isChecked = indeterminate || checked;

    return (
      <label
        className={cn(
          'inline-flex items-center gap-2 cursor-pointer',
          disabled && 'cursor-not-allowed opacity-50',
          className,
        )}
      >
        <span
          className={cn(
            'flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors',
            isChecked
              ? 'bg-primary-600 border-primary-600'
              : 'bg-white border-gray-300 hover:border-gray-400',
          )}
        >
          {indeterminate ? (
            <Minus className="h-3 w-3 text-white" strokeWidth={3} />
          ) : checked ? (
            <Check className="h-3 w-3 text-white" strokeWidth={3} />
          ) : null}
        </span>
        <input
          ref={ref}
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange?.(e.target.checked)}
          disabled={disabled}
          className="sr-only"
          aria-checked={indeterminate ? 'mixed' : checked}
        />
        {label && <span className="text-sm text-gray-700 select-none">{label}</span>}
      </label>
    );
  },
);
Checkbox.displayName = 'Checkbox';
