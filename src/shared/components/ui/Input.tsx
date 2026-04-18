import { forwardRef } from 'react';
import { cn } from '@/shared/utils/cn';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  error?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, leftIcon, rightIcon, error, ...props }, ref) => {
    return (
      <div className="relative flex items-center">
        {leftIcon && (
          <span className="pointer-events-none absolute left-3 flex items-center text-gray-400">
            {leftIcon}
          </span>
        )}
        <input
          ref={ref}
          className={cn(
            'flex h-9 w-full rounded-md border bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400',
            'transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-0',
            'disabled:cursor-not-allowed disabled:opacity-50',
            error
              ? 'border-danger-500 focus-visible:ring-danger-500'
              : 'border-gray-300 hover:border-gray-400',
            leftIcon && 'pl-9',
            rightIcon && 'pr-9',
            className,
          )}
          {...props}
        />
        {rightIcon && (
          <span className="absolute right-3 flex items-center text-gray-400">
            {rightIcon}
          </span>
        )}
      </div>
    );
  },
);
Input.displayName = 'Input';
