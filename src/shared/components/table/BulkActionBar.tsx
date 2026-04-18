import { cn } from '@/shared/utils/cn';

interface BulkActionBarProps {
  selectedCount: number;
  actions: React.ReactNode;
  className?: string;
}

export function BulkActionBar({ selectedCount, actions, className }: BulkActionBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div
      className={cn(
        'flex items-center justify-between gap-4 rounded-lg border border-primary-200 bg-primary-50 px-4 py-2.5',
        className,
      )}
    >
      <p className="text-sm font-medium text-primary-700">
        {selectedCount} {selectedCount === 1 ? 'item' : 'items'} selected
      </p>
      <div className="flex items-center gap-2">{actions}</div>
    </div>
  );
}
