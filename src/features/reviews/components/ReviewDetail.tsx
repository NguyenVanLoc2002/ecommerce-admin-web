import { CheckCheck, Star, XCircle } from 'lucide-react';
import { Badge } from '@/shared/components/ui/Badge';
import { Button } from '@/shared/components/ui/Button';
import { SkeletonDetail } from '@/shared/components/feedback/Skeleton';
import { ErrorCard } from '@/shared/components/feedback/ErrorCard';
import { formatDateTime } from '@/shared/utils/formatDate';
import { usePermission } from '@/constants/permissions';
import { useApproveReview } from '../hooks/useApproveReview';
import type { Review } from '../types/review.types';
import { toast } from '@/shared/stores/uiStore';

const STATUS_BADGE: Record<Review['status'], { variant: 'warning' | 'success' | 'danger'; label: string }> = {
  PENDING: { variant: 'warning', label: 'Pending' },
  APPROVED: { variant: 'success', label: 'Approved' },
  REJECTED: { variant: 'danger', label: 'Rejected' },
};

interface ReviewDetailProps {
  review: Review | undefined;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  onReject: (review: Review) => void;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${i < rating ? 'fill-warning-400 text-warning-400' : 'fill-gray-200 text-gray-200'}`}
        />
      ))}
      <span className="ml-1.5 text-sm font-medium text-gray-700">{rating}/5</span>
    </div>
  );
}

export function ReviewDetail({ review, isLoading, isError, onRetry, onReject }: ReviewDetailProps) {
  const canWrite = usePermission('reviews', 'write');
  const approveReview = useApproveReview();

  if (isLoading) return <SkeletonDetail />;
  if (isError) return <ErrorCard onRetry={onRetry} />;

  if (!review) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
          <Star className="h-6 w-6 text-gray-400" />
        </div>
        <p className="text-sm font-medium text-gray-500">Select a review to see details</p>
        <p className="mt-1 text-xs text-gray-400">
          Press <kbd className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-xs">A</kbd> to
          approve or{' '}
          <kbd className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-xs">R</kbd> to reject
          the focused review.
        </p>
      </div>
    );
  }

  const statusCfg = STATUS_BADGE[review.status];
  const isPending = review.status === 'PENDING';

  const handleApprove = () => {
    approveReview.mutate(
      { id: review.id },
      { onSuccess: () => toast.success('Review approved.') },
    );
  };

  return (
    <div className="space-y-5">
      {/* Status + actions */}
      <div className="flex items-center justify-between">
        <Badge variant={statusCfg.variant}>{statusCfg.label}</Badge>
        {isPending && canWrite && (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="ghost"
              className="border border-success-300 text-success-700 hover:bg-success-50"
              leftIcon={<CheckCheck className="h-4 w-4" />}
              onClick={handleApprove}
              disabled={approveReview.isPending}
              isLoading={approveReview.isPending}
            >
              Approve
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="border border-danger-300 text-danger-700 hover:bg-danger-50"
              leftIcon={<XCircle className="h-4 w-4" />}
              onClick={() => onReject(review)}
            >
              Reject
            </Button>
          </div>
        )}
      </div>

      {/* Rating */}
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-gray-400 mb-1.5">Rating</p>
        <StarRating rating={review.rating} />
      </div>

      {/* Comment */}
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-gray-400 mb-1.5">Comment</p>
        <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">{review.comment}</p>
      </div>

      {/* Product */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-gray-400 mb-1">Product</p>
          <p className="text-sm text-gray-700">{review.productName}</p>
          <p className="text-xs text-gray-400 mt-0.5">{review.variantName}</p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-gray-400 mb-1">SKU</p>
          <p className="font-mono text-sm text-gray-700">{review.sku}</p>
        </div>
      </div>

      {/* Customer + date */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-gray-400 mb-1">Customer</p>
          <p className="text-sm text-gray-700">{review.customerName}</p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-gray-400 mb-1">Submitted</p>
          <p className="text-sm text-gray-700">{formatDateTime(review.createdAt)}</p>
        </div>
      </div>

      {/* Moderation info (only when moderated) */}
      {review.status !== 'PENDING' && (
        <div className="rounded-md border border-gray-200 bg-gray-50 p-4 space-y-2">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Moderation</p>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-xs text-gray-400">By</p>
              <p className="text-gray-700">{review.moderatedBy ?? '—'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">At</p>
              <p className="text-gray-700">
                {review.moderatedAt ? formatDateTime(review.moderatedAt) : '—'}
              </p>
            </div>
          </div>
          {review.adminNote && (
            <div>
              <p className="text-xs text-gray-400 mb-1">Admin note</p>
              <p className="text-sm text-gray-700 italic">{review.adminNote}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
