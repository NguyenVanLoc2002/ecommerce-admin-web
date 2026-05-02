import { X } from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import { Button } from '@/shared/components/ui/Button';

export interface FilterChip {
  key: string;
  label: string;
  value: string;
}

interface FilterChipsProps {
  chips: FilterChip[];
  onRemove: (key: string) => void;
  onReset: () => void;
  className?: string;
}

export function FilterChips({ chips, onRemove, onReset, className }: FilterChipsProps) {
  if (chips.length === 0) return null;

  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      {chips.map((chip) => (
        <span
          key={chip.key}
          className="inline-flex items-center gap-1 rounded-full bg-primary-50 border border-primary-200 px-2.5 py-0.5 text-xs font-medium text-primary-700"
        >
          {chip.label}: {chip.value}
          <button
            type="button"
            onClick={() => onRemove(chip.key)}
            aria-label={`Remove ${chip.label} filter`}
            className="ml-0.5 rounded-full p-0.5 hover:text-primary-900 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary-500"
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
      <Button variant="ghost" size="sm" onClick={onReset} className="text-xs text-gray-500">
        Reset filters
      </Button>
    </div>
  );
}
