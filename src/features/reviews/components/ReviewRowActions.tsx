import { CheckCheck, Trash2, XCircle } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { useConfirmDialog } from '@/shared/hooks/useConfirmDialog';
import { toast } from '@/shared/stores/uiStore';
import { usePermission } from '@/constants/permissions';
import { useApproveReview } from '../hooks/useApproveReview';
import { useDeleteReview } from '../hooks/useDeleteReview';
import type { Review } from '../types/review.types';

interface ReviewRowActionsProps {
  review: Review;
  onReject: (review: Review) => void;
}

export function ReviewRowActions({ review, onReject }: ReviewRowActionsProps) {
  const { confirm } = useConfirmDialog();
  const canWrite = usePermission('reviews', 'write');
  const canDelete = usePermission('reviews', 'delete');
  const approveReview = useApproveReview();
  const deleteReview = useDeleteReview();

  const isPending = review.status === 'PENDING';

  const handleApprove = () => {
    approveReview.mutate(
      { id: review.id },
      { onSuccess: () => toast.success('Review approved.') },
    );
  };

  const handleDelete = async () => {
    const ok = await confirm({
      title: 'Delete review?',
      description: 'This review will be permanently removed and cannot be recovered.',
      confirmLabel: 'Delete',
      variant: 'destructive',
    });
    if (!ok) return;

    deleteReview.mutate(review.id, {
      onSuccess: () => toast.success('Review deleted.'),
      onError: (error) => toast.error(error.message ?? 'Failed to delete review.'),
    });
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
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => void handleDelete()}
        disabled={!canDelete || deleteReview.isPending}
        title={canDelete ? 'Delete review' : 'Requires Admin role'}
        aria-label="Delete review"
      >
        <Trash2 className="h-4 w-4 text-danger-500" />
      </Button>
    </div>
  );
}
