import { forwardRef } from 'react';
import { cn } from '@/shared/utils/cn';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          'flex min-h-[80px] w-full rounded-md border bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400',
          'transition-colors resize-y',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-0',
          'disabled:cursor-not-allowed disabled:opacity-50',
          error
            ? 'border-danger-500 focus-visible:ring-danger-500'
            : 'border-gray-300 hover:border-gray-400',
          className,
        )}
        {...props}
      />
    );
  },
);
Textarea.displayName = 'Textarea';
