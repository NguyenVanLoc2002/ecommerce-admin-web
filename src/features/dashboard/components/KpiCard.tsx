import { RefreshCw } from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import { SkeletonStat } from '@/shared/components/feedback/Skeleton';

interface KpiCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  iconBg?: string;
  iconColor?: string;
  description?: string;
  onClick?: () => void;
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
}

export function KpiCard({
  title,
  value,
  icon: Icon,
  iconBg = 'bg-primary-50',
  iconColor = 'text-primary-600',
  description,
  onClick,
  isLoading,
  isError,
  onRetry,
}: KpiCardProps) {
  if (isLoading) return <SkeletonStat />;

  return (
    <div
      className={cn(
        'rounded-lg border border-gray-200 bg-white p-5 transition-shadow',
        onClick && 'cursor-pointer hover:shadow-md',
      )}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
    >
      <div className="flex items-start justify-between">
        <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg', iconBg)}>
          <Icon className={cn('h-5 w-5', iconColor)} aria-hidden />
        </div>
        {isError && onRetry && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onRetry(); }}
            className="rounded p-1 text-gray-400 hover:text-gray-600"
            aria-label="Retry"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        )}
      </div>
      <div className="mt-3">
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="mt-1 text-2xl font-semibold text-gray-900 tabular-nums">
          {isError ? '—' : value}
        </p>
        {description && !isError && (
          <p className="mt-1 text-xs text-gray-400">{description}</p>
        )}
      </div>
    </div>
  );
}
