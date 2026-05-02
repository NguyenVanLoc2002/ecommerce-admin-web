import { RefreshCw } from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import { SkeletonStat } from '@/shared/components/feedback/Skeleton';
import { useCountUp } from '../hooks/useCountUp';

interface KpiCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  iconBg?: string;
  iconColor?: string;
  onClick?: () => void;
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  showPulse?: boolean;
}

export function KpiCard({
  title,
  value,
  icon: Icon,
  iconBg = 'bg-primary-50',
  iconColor = 'text-primary-600',
  onClick,
  isLoading,
  isError,
  onRetry,
  showPulse = false,
}: KpiCardProps) {
  // Hook must be called before any conditional return to satisfy React hook rules.
  // When loading, target stays 0; animation triggers when real value first arrives.
  const numericTarget = !isLoading && typeof value === 'number' && !isError ? value : 0;
  const animated = useCountUp(numericTarget);

  if (isLoading) return <SkeletonStat />;

  const display = isError ? '—' : typeof value === 'number' ? animated : value;

  return (
    <div
      className={cn(
        'relative rounded-xl border border-gray-200 bg-white p-5 outline-none',
        'transition-all duration-200',
        onClick && 'cursor-pointer hover:border-gray-300 hover:shadow-sm',
        onClick &&
          'focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
      )}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
    >
      <div className="flex items-start justify-between">
        <div className="relative">
          <div className={cn('flex h-9 w-9 items-center justify-center rounded-lg', iconBg)}>
            <Icon className={cn('h-5 w-5', iconColor)} aria-hidden />
          </div>
          {showPulse && (
            <span aria-hidden className="absolute -right-1 -top-1 flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-danger-400 opacity-60" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-danger-500 ring-2 ring-white" />
            </span>
          )}
        </div>
        {isError && onRetry && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRetry();
            }}
            className="rounded p-1 text-gray-400 hover:text-gray-600"
            aria-label="Retry"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <div className="mt-4">
        <p className="text-[11px] font-medium uppercase tracking-widest text-gray-400">{title}</p>
        <p className="mt-1.5 text-2xl font-semibold leading-none text-gray-900 tabular-nums">
          {display}
        </p>
      </div>
    </div>
  );
}
