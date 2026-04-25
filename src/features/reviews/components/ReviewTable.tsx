import { useMemo } from 'react';
import { Star } from 'lucide-react';
import { DataTable } from '@/shared/components/table/DataTable';
import { Pagination } from '@/shared/components/table/Pagination';
import { Badge } from '@/shared/components/ui/Badge';
import { Select } from '@/shared/components/ui/Select';
import { SkeletonTable } from '@/shared/components/feedback/Skeleton';
import { ErrorCard } from '@/shared/components/feedback/ErrorCard';
import { EmptyState } from '@/shared/components/feedback/EmptyState';
import { formatDateTime } from '@/shared/utils/formatDate';
import type { ColumnDef } from '@/shared/components/table/types';
import type { RowSelectionState } from '@/shared/components/table/types';
import type { PaginatedResponse } from '@/shared/types/api.types';
import type { Review, ReviewListParams } from '../types/review.types';
import { ReviewRowActions } from './ReviewRowActions';

const STATUS_OPTIONS = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'REJECTED', label: 'Rejected' },
];

const STATUS_BADGE_VARIANT: Record<
  Review['status'],
  'warning' | 'success' | 'danger'
> = {
  PENDING: 'warning',
  APPROVED: 'success',
  REJECTED: 'danger',
};

const RATING_OPTIONS = [
  { value: '', label: 'All ratings' },
  { value: '1', label: '1+' },
  { value: '2', label: '2+' },
  { value: '3', label: '3+' },
  { value: '4', label: '4+' },
  { value: '5', label: '5 only' },
];

interface ReviewTableProps {
  data: PaginatedResponse<Review> | undefined;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  filters: ReviewListParams;
  onFiltersChange: (updates: Partial<ReviewListParams>) => void;
  rowSelection: RowSelectionState;
  onRowSelectionChange: (s: RowSelectionState) => void;
  activeRowId: string | undefined;
  onRowClick: (review: Review) => void;
  onReject: (review: Review) => void;
}

function InlineStars({ rating }: { rating: number }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={`h-3 w-3 ${i < rating ? 'fill-warning-400 text-warning-400' : 'fill-gray-200 text-gray-200'}`}
        />
      ))}
    </span>
  );
}

export function ReviewTable({
  data,
  isLoading,
  isError,
  onRetry,
  filters,
  onFiltersChange,
  rowSelection,
  onRowSelectionChange,
  activeRowId,
  onRowClick,
  onReject,
}: ReviewTableProps) {
  const columns = useMemo<ColumnDef<Review>[]>(
    () => [
      {
        id: 'select',
        header: '',
      },
      {
        id: 'customer',
        header: 'Customer',
        cell: ({ row }) => (
          <div>
            <p className="text-sm font-medium text-gray-900">{row.original.customerName}</p>
            <p className="text-xs text-gray-400 mt-0.5">{formatDateTime(row.original.createdAt)}</p>
          </div>
        ),
      },
      {
        id: 'product',
        header: 'Product',
        cell: ({ row }) => (
          <div>
            <p className="text-sm text-gray-700 line-clamp-1">{row.original.productName}</p>
            <p className="text-xs text-gray-400 mt-0.5">{row.original.variantName}</p>
          </div>
        ),
      },
      {
        id: 'rating',
        header: 'Rating',
        cell: ({ row }) => <InlineStars rating={row.original.rating} />,
      },
      {
        id: 'comment',
        header: 'Comment',
        cell: ({ row }) => (
          <p className="max-w-[200px] truncate text-sm text-gray-600" title={row.original.comment}>
            {row.original.comment}
          </p>
        ),
      },
      {
        id: 'status',
        header: 'Status',
        cell: ({ row }) => (
          <Badge variant={STATUS_BADGE_VARIANT[row.original.status]}>
            {row.original.status.charAt(0) + row.original.status.slice(1).toLowerCase()}
          </Badge>
        ),
      },
      {
        id: 'actions',
        header: '',
        className: 'w-20',
        cell: ({ row }) => (
          <ReviewRowActions review={row.original} onReject={onReject} />
        ),
      },
    ],
    [onReject],
  );

  if (isLoading) return <SkeletonTable rows={8} />;
  if (isError) return <ErrorCard onRetry={onRetry} />;

  const currentStatus = filters.status ?? 'PENDING';

  return (
    <div className="space-y-3">
      {/* Inline filter toolbar */}
      <div className="flex items-center gap-3">
        <div className="flex gap-1 rounded-lg border border-gray-200 bg-gray-50 p-1">
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() =>
                onFiltersChange({ status: opt.value as Review['status'], page: 0 })
              }
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                currentStatus === opt.value
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <Select
          options={RATING_OPTIONS}
          value={filters.minRating != null ? String(filters.minRating) : ''}
          onChange={(e) => {
            const val = e.target.value;
            onFiltersChange({
              minRating: val ? Number(val) : undefined,
              maxRating: val === '5' ? 5 : undefined,
              page: 0,
            });
          }}
          className="w-36 text-xs"
        />
      </div>

      <DataTable
        data={data?.items ?? []}
        columns={columns}
        getRowId={(row) => String(row.id)}
        rowSelection={rowSelection}
        onRowSelectionChange={onRowSelectionChange}
        activeRowId={activeRowId}
        onRowClick={onRowClick}
        emptyState={
          <EmptyState
            icon={<Star className="h-10 w-10" />}
            title={
              currentStatus === 'PENDING'
                ? 'No reviews pending — you\'re all caught up!'
                : `No ${currentStatus.toLowerCase()} reviews`
            }
            message={
              currentStatus === 'PENDING'
                ? 'All reviews have been moderated.'
                : undefined
            }
          />
        }
      />

      {data && data.totalPages > 1 && (
        <Pagination
          pagination={data}
          onPageChange={(page) => onFiltersChange({ page } as Partial<ReviewListParams>)}
          onPageSizeChange={(size) => onFiltersChange({ size } as Partial<ReviewListParams>)}
        />
      )}
    </div>
  );
}
