import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Modal } from '@/shared/components/ui/Modal';
import { Button } from '@/shared/components/ui/Button';
import { Textarea } from '@/shared/components/ui/Textarea';
import { toast } from '@/shared/stores/uiStore';
import { rejectReviewSchema, type RejectReviewFormValues } from '../schemas/rejectReviewSchema';
import { useRejectReview } from '../hooks/useRejectReview';
import type { Review } from '../types/review.types';

interface RejectModalProps {
  review: Review | null;
  onClose: () => void;
}

export function RejectModal({ review, onClose }: RejectModalProps) {
  const rejectReview = useRejectReview();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<RejectReviewFormValues>({
    resolver: zodResolver(rejectReviewSchema),
    defaultValues: { adminNote: '' },
  });

  const adminNote = watch('adminNote');

  useEffect(() => {
    if (!review) reset({ adminNote: '' });
  }, [review, reset]);

  const onSubmit = (values: RejectReviewFormValues) => {
    if (!review) return;
    rejectReview.mutate(
      { id: review.id, adminNote: values.adminNote },
      {
        onSuccess: () => {
          toast.success('Review rejected.');
          reset({ adminNote: '' });
          onClose();
        },
      },
    );
  };

  return (
    <Modal
      open={review !== null}
      onClose={onClose}
      title="Reject Review"
      description="Provide a note explaining why this review is being rejected."
      size="md"
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="bg-danger-600 text-white hover:bg-danger-700"
            onClick={() => void handleSubmit(onSubmit)()}
            disabled={adminNote.trim().length < 10 || rejectReview.isPending}
            isLoading={rejectReview.isPending}
          >
            Reject Review
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-700">
          Reason for rejection <span className="text-danger-500">*</span>
        </label>
        <Textarea
          {...register('adminNote')}
          placeholder="Describe why this review doesn't meet guidelines…"
          rows={4}
          error={!!errors.adminNote}
          autoFocus
        />
        <div className="flex items-center justify-between">
          {errors.adminNote ? (
            <p className="text-xs text-danger-600">{errors.adminNote.message}</p>
          ) : (
            <p className="text-xs text-gray-400">Minimum 10 characters</p>
          )}
          <p className="text-xs text-gray-400 tabular-nums">{adminNote.length} / 500</p>
        </div>
      </div>
    </Modal>
  );
}
