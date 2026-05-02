import { CheckCheck, Star, XCircle } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { StatusBadge } from '@/shared/components/ui/StatusBadge';
import { SkeletonDetail } from '@/shared/components/feedback/Skeleton';
import { ErrorCard } from '@/shared/components/feedback/ErrorCard';
import { formatDateTime } from '@/shared/utils/formatDate';
import { usePermission } from '@/constants/permissions';
import { useApproveReview } from '../hooks/useApproveReview';
import { toast } from '@/shared/stores/uiStore';
import type { Review } from '../types/review.types';

interface ReviewDetailProps {
  review: Review | undefined;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  onReject: (review: Review) => void;
  recordStatus?: boolean;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, index) => (
        <Star
          key={index}
          className={`h-4 w-4 ${
            index < rating ? 'fill-warning-400 text-warning-400' : 'fill-gray-200 text-gray-200'
          }`}
        />
      ))}
      <span className="ml-1.5 text-sm font-medium text-gray-700">{rating}/5</span>
    </div>
  );
}

export function ReviewDetail({
  review,
  isLoading,
  isError,
  onRetry,
  onReject,
  recordStatus,
}: ReviewDetailProps) {
  const canWrite = usePermission('reviews', 'write');
  const approveReview = useApproveReview();

  if (isLoading) {
    return <SkeletonDetail />;
  }

  if (isError) {
    return <ErrorCard onRetry={onRetry} />;
  }

  if (!review) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
          <Star className="h-6 w-6 text-gray-400" />
        </div>
        <p className="text-sm font-medium text-gray-500">Select a review to see details</p>
        <p className="mt-1 text-xs text-gray-400">
          Press <kbd className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-xs">A</kbd> to
          approve or <kbd className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-xs">R</kbd>{' '}
          to reject when this panel is focused.
        </p>
      </div>
    );
  }

  const isPending = review.status === 'PENDING';
  const variantLabel = [review.variantName, review.sku ? `SKU ${review.sku}` : null]
    .filter(Boolean)
    .join(' - ');

  const handleApprove = () => {
    approveReview.mutate(
      { id: review.id },
      { onSuccess: () => toast.success('Review approved.') },
    );
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-2">
          <StatusBadge type="review" status={review.status} />
          <StatusBadge type="soft-delete" status={recordStatus} />
        </div>

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

      <div>
        <p className="mb-1.5 text-xs font-medium uppercase tracking-wider text-gray-400">Rating</p>
        <StarRating rating={review.rating} />
      </div>

      <div>
        <p className="mb-1.5 text-xs font-medium uppercase tracking-wider text-gray-400">Comment</p>
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-800">
          {review.comment || 'No comment provided.'}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="mb-1 text-xs font-medium uppercase tracking-wider text-gray-400">Product</p>
          <p className="text-sm text-gray-700">{review.productName}</p>
          <p className="mt-0.5 text-xs text-gray-400">
            {variantLabel || 'Variant not specified'}
          </p>
        </div>
        <div>
          <p className="mb-1 text-xs font-medium uppercase tracking-wider text-gray-400">
            Customer
          </p>
          <p className="text-sm text-gray-700">{review.customerName}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="mb-1 text-xs font-medium uppercase tracking-wider text-gray-400">Created</p>
          <p className="text-sm text-gray-700">{formatDateTime(review.createdAt)}</p>
        </div>
        <div>
          <p className="mb-1 text-xs font-medium uppercase tracking-wider text-gray-400">Updated</p>
          <p className="text-sm text-gray-700">
            {review.updatedAt ? formatDateTime(review.updatedAt) : 'Not available'}
          </p>
        </div>
      </div>

      <div className="space-y-2 rounded-md border border-gray-200 bg-gray-50 p-4">
        <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Moderation</p>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-xs text-gray-400">By</p>
            <p className="text-gray-700">{review.moderatedBy ?? 'Not available'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">At</p>
            <p className="text-gray-700">
              {review.moderatedAt ? formatDateTime(review.moderatedAt) : 'Not available'}
            </p>
          </div>
        </div>
        <div>
          <p className="mb-1 text-xs text-gray-400">Admin note</p>
          <p className="text-sm text-gray-700">{review.adminNote || 'No admin note.'}</p>
        </div>
      </div>
    </div>
  );
}
