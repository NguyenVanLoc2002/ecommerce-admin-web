import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { cn } from '@/shared/utils/cn';

interface CopyValueButtonProps {
  value: string;
  label?: string;
  copiedLabel?: string;
  className?: string;
}

export function CopyValueButton({
  value,
  label = 'Copy',
  copiedLabel = 'Copied',
  className,
}: CopyValueButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    void navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1_500);
    });
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={copied ? copiedLabel : label}
      className={cn(
        'inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-1',
        className,
      )}
    >
      {copied ? (
        <Check className="h-3.5 w-3.5 text-success-600" aria-hidden />
      ) : (
        <Copy className="h-3.5 w-3.5" aria-hidden />
      )}
      <span>{copied ? copiedLabel : label}</span>
    </button>
  );
}
