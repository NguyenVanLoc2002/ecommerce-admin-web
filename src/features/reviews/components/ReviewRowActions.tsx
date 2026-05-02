import { CheckCheck, XCircle } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { toast } from '@/shared/stores/uiStore';
import { usePermission } from '@/constants/permissions';
import { useApproveReview } from '../hooks/useApproveReview';
import type { Review } from '../types/review.types';

interface ReviewRowActionsProps {
  review: Review;
  onReject: (review: Review) => void;
}

export function ReviewRowActions({ review, onReject }: ReviewRowActionsProps) {
  const canWrite = usePermission('reviews', 'write');
  const approveReview = useApproveReview();

  const isPending = review.status === 'PENDING';

  const handleApprove = () => {
    approveReview.mutate(
      { id: review.id },
      { onSuccess: () => toast.success('Review approved.') },
    );
  };

  return (
    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
      {isPending && (
        <>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={handleApprove}
            disabled={!canWrite || approveReview.isPending}
            title={canWrite ? 'Approve' : 'Requires Staff role'}
            aria-label="Approve review"
          >
            <CheckCheck className="h-4 w-4 text-success-600" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => onReject(review)}
            disabled={!canWrite}
            title={canWrite ? 'Reject' : 'Requires Staff role'}
            aria-label="Reject review"
          >
            <XCircle className="h-4 w-4 text-danger-500" />
          </Button>
        </>
      )}
    </div>
  );
}
