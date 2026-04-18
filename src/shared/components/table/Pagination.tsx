import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import { Select } from '@/shared/components/ui/Select';
import { Button } from '@/shared/components/ui/Button';
import type { PaginatedResponse } from '@/shared/types/api.types';

const PAGE_SIZE_OPTIONS = [
  { value: '10', label: '10 / page' },
  { value: '20', label: '20 / page' },
  { value: '50', label: '50 / page' },
  { value: '100', label: '100 / page' },
];

interface PaginationProps {
  pagination: Pick<PaginatedResponse<unknown>, 'totalElements' | 'totalPages' | 'number' | 'size'>;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  className?: string;
}

export function Pagination({
  pagination,
  onPageChange,
  onPageSizeChange,
  className,
}: PaginationProps) {
  const { totalElements, totalPages, number: page, size } = pagination;

  const from = totalElements === 0 ? 0 : page * size + 1;
  const to = Math.min((page + 1) * size, totalElements);

  const pageNumbers = buildPageNumbers(page, totalPages);

  return (
    <div className={cn('flex items-center justify-between gap-4 py-3 px-4', className)}>
      <p className="text-sm text-gray-500">
        Showing <span className="font-medium text-gray-700">{from}–{to}</span> of{' '}
        <span className="font-medium text-gray-700">{totalElements}</span> results
      </p>
      <div className="flex items-center gap-2">
        <Select
          options={PAGE_SIZE_OPTIONS}
          value={String(size)}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          className="w-32 h-8 text-xs"
        />
        <div className="flex items-center gap-1">
          <Button
            variant="secondary"
            size="icon-sm"
            onClick={() => onPageChange(page - 1)}
            disabled={page === 0}
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          {pageNumbers.map((p, i) =>
            p === '...' ? (
              <span key={`ellipsis-${i}`} className="px-1 text-gray-400 text-sm select-none">
                …
              </span>
            ) : (
              <button
                key={p}
                type="button"
                onClick={() => onPageChange(p)}
                className={cn(
                  'h-8 w-8 rounded text-sm font-medium transition-colors',
                  p === page
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100',
                )}
              >
                {p + 1}
              </button>
            ),
          )}
          <Button
            variant="secondary"
            size="icon-sm"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages - 1}
            aria-label="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function buildPageNumbers(current: number, total: number): (number | '...')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i);

  const pages: (number | '...')[] = [];
  const addPage = (p: number) => {
    if (!pages.includes(p)) pages.push(p);
  };

  addPage(0);
  if (current > 2) pages.push('...');
  for (let p = Math.max(1, current - 1); p <= Math.min(total - 2, current + 1); p++) addPage(p);
  if (current < total - 3) pages.push('...');
  addPage(total - 1);

  return pages;
}
