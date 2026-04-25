import { useRef, useState, useEffect } from 'react';
import { ChevronDown, X, Check } from 'lucide-react';
import { cn } from '@/shared/utils/cn';

export interface MultiSelectOption {
  value: number | string;
  label: string;
}

interface MultiSelectDropdownProps {
  options: MultiSelectOption[];
  value: (number | string)[];
  onChange: (value: (number | string)[]) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  className?: string;
}

export function MultiSelectDropdown({
  options,
  value,
  onChange,
  placeholder = 'Select…',
  disabled,
  error,
  className,
}: MultiSelectDropdownProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const toggle = (optValue: number | string) => {
    if (value.includes(optValue)) {
      onChange(value.filter((v) => v !== optValue));
    } else {
      onChange([...value, optValue]);
    }
  };

  const removeItem = (e: React.MouseEvent, optValue: number | string) => {
    e.stopPropagation();
    onChange(value.filter((v) => v !== optValue));
  };

  const selectedLabels = options.filter((o) => value.includes(o.value));

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <button
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          'flex min-h-9 w-full items-center justify-between rounded-md border bg-white px-3 py-1.5 text-sm text-left',
          'transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
          'disabled:cursor-not-allowed disabled:opacity-50',
          error
            ? 'border-danger-500 focus-visible:ring-danger-500'
            : 'border-gray-300 hover:border-gray-400',
        )}
      >
        <div className="flex flex-1 flex-wrap gap-1 pr-2">
          {selectedLabels.length === 0 ? (
            <span className="text-gray-400">{placeholder}</span>
          ) : (
            selectedLabels.map((opt) => (
              <span
                key={opt.value}
                className="inline-flex items-center gap-0.5 rounded bg-primary-50 border border-primary-200 px-1.5 py-0.5 text-xs text-primary-700"
              >
                {opt.label}
                <button
                  type="button"
                  onClick={(e) => removeItem(e, opt.value)}
                  className="rounded hover:text-primary-900"
                  aria-label={`Remove ${opt.label}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))
          )}
        </div>
        <ChevronDown
          className={cn(
            'h-4 w-4 shrink-0 text-gray-400 transition-transform',
            open && 'rotate-180',
          )}
          aria-hidden
        />
      </button>

      {open && !disabled && (
        <div className="absolute z-50 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-md">
          <ul className="max-h-60 overflow-y-auto py-1" role="listbox" aria-multiselectable>
            {options.length === 0 ? (
              <li className="px-3 py-2 text-sm text-gray-400">No options available</li>
            ) : (
              options.map((opt) => {
                const selected = value.includes(opt.value);
                return (
                  <li
                    key={opt.value}
                    role="option"
                    aria-selected={selected}
                    onClick={() => toggle(opt.value)}
                    className={cn(
                      'flex cursor-pointer items-center justify-between px-3 py-2 text-sm',
                      selected
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-gray-700 hover:bg-gray-50',
                    )}
                  >
                    <span>{opt.label}</span>
                    {selected && <Check className="h-3.5 w-3.5 shrink-0" />}
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
