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
  pagination: Pick<PaginatedResponse<unknown>, 'totalItems' | 'totalPages' | 'page' | 'size'>;
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
  const { totalItems, totalPages, page, size } = pagination;

  const from = totalItems === 0 ? 0 : page * size + 1;
  const to = Math.min((page + 1) * size, totalItems);
  const pageNumbers = buildPageNumbers(page, totalPages);

  return (
    <nav
      aria-label="Pagination"
      className={cn(
        'flex flex-col gap-3 px-4 py-3 md:flex-row md:items-center md:justify-between',
        className,
      )}
    >
      <p className="text-sm text-gray-500" aria-live="polite" aria-atomic>
        Showing <span className="font-medium text-gray-700">{from}-{to}</span> of{' '}
        <span className="font-medium text-gray-700">{totalItems}</span> results
      </p>

      <div className="flex flex-wrap items-center gap-2 md:justify-end">
        <Select
          options={PAGE_SIZE_OPTIONS}
          value={String(size)}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          className="h-8 w-32 text-xs"
          aria-label="Results per page"
        />

        <div className="flex flex-wrap items-center gap-1">
          <Button
            variant="secondary"
            size="icon-sm"
            onClick={() => onPageChange(page - 1)}
            disabled={page === 0}
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {pageNumbers.map((pageNumber, index) =>
            pageNumber === '...' ? (
              <span
                key={`ellipsis-${index}`}
                className="select-none px-1 text-sm text-gray-400"
                aria-hidden
              >
                ...
              </span>
            ) : (
              <button
                key={pageNumber}
                type="button"
                onClick={() => onPageChange(pageNumber)}
                aria-label={`Page ${pageNumber + 1}`}
                aria-current={pageNumber === page ? 'page' : undefined}
                className={cn(
                  'h-8 w-8 rounded text-sm font-medium transition-colors',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-1',
                  pageNumber === page
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100',
                )}
              >
                {pageNumber + 1}
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
    </nav>
  );
}

function buildPageNumbers(current: number, total: number): (number | '...')[] {
  if (total <= 0) {
    return [];
  }

  if (total <= 7) {
    return Array.from({ length: total }, (_, index) => index);
  }

  const pages: (number | '...')[] = [];
  const addPage = (pageNumber: number) => {
    if (!pages.includes(pageNumber)) {
      pages.push(pageNumber);
    }
  };

  addPage(0);

  if (current > 2) {
    pages.push('...');
  }

  for (
    let pageNumber = Math.max(1, current - 1);
    pageNumber <= Math.min(total - 2, current + 1);
    pageNumber += 1
  ) {
    addPage(pageNumber);
  }

  if (current < total - 3) {
    pages.push('...');
  }

  addPage(total - 1);

  return pages;
}
