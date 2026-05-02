import { Link } from 'react-router-dom';
import { ArrowRight, Star } from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import { routes } from '@/constants/routes';
import { SkeletonTable } from '@/shared/components/feedback/Skeleton';
import { ErrorCard } from '@/shared/components/feedback/ErrorCard';
import { formatRelativeTime } from '@/shared/utils/formatDate';
import { useDashboardPendingReviews } from '../hooks/useDashboardPendingReviews';

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="group flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            'h-3 w-3 transition-transform duration-100',
            i < rating
              ? 'fill-warning-400 text-warning-400 group-hover:scale-110'
              : 'text-gray-200',
          )}
          aria-hidden
        />
      ))}
    </span>
  );
}

export function PendingReviewsPanel() {
  const { data, isLoading, isError, refetch } = useDashboardPendingReviews();

  return (
    <div className="rounded-lg border border-gray-200 bg-white">
      <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
        <h2 className="text-sm font-semibold text-gray-900">Pending Reviews</h2>
        <Link
          to={routes.reviews.list}
          className="flex items-center gap-1 text-xs font-medium text-primary-600 hover:text-primary-700"
        >
          View all
          <ArrowRight className="h-3.5 w-3.5" aria-hidden />
        </Link>
      </div>

      {isLoading && (
        <div className="p-4">
          <SkeletonTable rows={4} />
        </div>
      )}

      {isError && (
        <ErrorCard
          message="Failed to load pending reviews."
          onRetry={refetch}
          className="py-10"
        />
      )}

      {!isLoading && !isError && (
        <>
          {data?.items.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-gray-400">
              No pending reviews — queue is clear.
            </p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {data?.items.map((review) => (
                <li key={review.id} className="px-5 py-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-gray-900">
                        {review.productName}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-gray-500">
                        {review.customerName}
                      </p>
                      {review.comment && (
                        <p className="mt-1 line-clamp-2 text-xs text-gray-500">
                          {review.comment}
                        </p>
                      )}
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <StarRating rating={review.rating} />
                      <span className="text-xs text-gray-400">
                        {formatRelativeTime(review.createdAt)}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
