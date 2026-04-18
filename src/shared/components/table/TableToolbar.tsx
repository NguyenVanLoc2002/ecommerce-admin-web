import { Search } from 'lucide-react';
import { Input } from '@/shared/components/ui/Input';
import { Spinner } from '@/shared/components/ui/Spinner';
import { cn } from '@/shared/utils/cn';

interface TableToolbarProps {
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  isSearching?: boolean;
  filters?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export function TableToolbar({
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search…',
  isSearching,
  filters,
  actions,
  className,
}: TableToolbarProps) {
  return (
    <div className={cn('flex flex-wrap items-center gap-3', className)}>
      {onSearchChange !== undefined && (
        <div className="relative min-w-[240px] flex-1 max-w-sm">
          <Input
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            leftIcon={<Search className="h-4 w-4" />}
            rightIcon={isSearching ? <Spinner size="sm" /> : undefined}
            className="w-full"
          />
        </div>
      )}
      {filters && <div className="flex items-center gap-2">{filters}</div>}
      {actions && <div className="flex items-center gap-2 ml-auto">{actions}</div>}
    </div>
  );
}
