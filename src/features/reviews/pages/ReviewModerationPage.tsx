import { useCallback, useEffect, useRef, useState } from 'react';
import { AdminLayout } from '@/shared/components/layout/AdminLayout';
import { PageHeader } from '@/shared/components/layout/PageHeader';
import { useTableFilters } from '@/shared/hooks/useTableFilters';
import { toast } from '@/shared/stores/uiStore';
import type { RowSelectionState } from '@/shared/components/table/types';
import { useApproveReview } from '../hooks/useApproveReview';
import { useReview } from '../hooks/useReview';
import { usePendingReviews } from '../hooks/usePendingReviews';
import { ReviewTable } from '../components/ReviewTable';
import { ReviewDetail } from '../components/ReviewDetail';
import { RejectModal } from '../components/RejectModal';
import { BulkApproveBar } from '../components/BulkApproveBar';
import type { Review, ReviewListParams } from '../types/review.types';

const DEFAULT_FILTERS: ReviewListParams = {
  page: 0,
  size: 20,
  sort: 'createdAt,asc',
  status: 'PENDING',
};

interface BulkProgress {
  done: number;
  total: number;
}

export function ReviewModerationPage() {
  const [filters, setFilters] = useTableFilters<ReviewListParams>(DEFAULT_FILTERS);
  const [selectedId, setSelectedId] = useState<number>(0);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [rejectTarget, setRejectTarget] = useState<Review | null>(null);
  const [bulkProgress, setBulkProgress] = useState<BulkProgress | null>(null);

  const { data, isLoading, isError, refetch } = usePendingReviews(filters);

  const {
    data: selectedReview,
    isLoading: detailLoading,
    isError: detailError,
    refetch: refetchDetail,
  } = useReview(selectedId);

  const approveReview = useApproveReview();

  const selectedIds = Object.entries(rowSelection)
    .filter(([, v]) => v)
    .map(([id]) => Number(id));

  // Auto-select first review when list loads and nothing is selected
  useEffect(() => {
    if (!selectedId && data?.items.length) {
      setSelectedId(data.items[0].id);
    }
  }, [data, selectedId]);

  const handleRowClick = (review: Review) => {
    setSelectedId(review.id);
  };

  const handleReject = (review: Review) => {
    setRejectTarget(review);
  };

  // Keyboard shortcuts — A to approve, R to reject
  const approveRef = useRef(approveReview);
  approveRef.current = approveReview;

  const handleKeyboardApprove = useCallback(() => {
    if (!selectedReview || selectedReview.status !== 'PENDING') return;
    approveRef.current.mutate(
      { id: selectedReview.id },
      { onSuccess: () => toast.success('Review approved.') },
    );
  }, [selectedReview]);

  const rejectTargetRef = useRef(rejectTarget);
  rejectTargetRef.current = rejectTarget;

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const target = e.target as Element;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT'
      ) {
        return;
      }
      if (e.key === 'a' || e.key === 'A') {
        handleKeyboardApprove();
      }
      if ((e.key === 'r' || e.key === 'R') && !rejectTargetRef.current) {
        if (selectedReview?.status === 'PENDING') {
          setRejectTarget(selectedReview);
        }
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [handleKeyboardApprove, selectedReview]);

  const handleBulkApprove = async () => {
    const ids = [...selectedIds];
    setBulkProgress({ done: 0, total: ids.length });

    let successCount = 0;
    for (let i = 0; i < ids.length; i++) {
      try {
        await approveReview.mutateAsync({ id: ids[i] });
        successCount++;
      } catch {
        // Continue with next; individual error toasts are handled in the hook
      }
      setBulkProgress({ done: i + 1, total: ids.length });
    }

    setBulkProgress(null);
    setRowSelection({});
    if (successCount > 0) {
      toast.success(`${successCount} review${successCount > 1 ? 's' : ''} approved.`);
    }
  };

  return (
    <AdminLayout>
      <div className="flex flex-col h-full p-6 space-y-4">
        <PageHeader
          title="Review Moderation"
          description="Approve or reject customer reviews before they appear on the storefront."
        />

        <div className="grid grid-cols-[1fr_420px] gap-6 items-start">
          {/* Left: list */}
          <ReviewTable
            data={data}
            isLoading={isLoading}
            isError={isError}
            onRetry={() => void refetch()}
            filters={filters}
            onFiltersChange={setFilters}
            rowSelection={rowSelection}
            onRowSelectionChange={setRowSelection}
            activeRowId={selectedId > 0 ? String(selectedId) : undefined}
            onRowClick={handleRowClick}
            onReject={handleReject}
          />

          {/* Right: detail */}
          <div className="sticky top-6 bg-white rounded-lg border border-gray-200 p-5 min-h-[300px]">
            <ReviewDetail
              review={selectedReview}
              isLoading={detailLoading}
              isError={detailError}
              onRetry={() => void refetchDetail()}
              onReject={handleReject}
            />
          </div>
        </div>
      </div>

      <RejectModal review={rejectTarget} onClose={() => setRejectTarget(null)} />

      <BulkApproveBar
        selectedCount={selectedIds.length}
        progress={bulkProgress}
        onApproveAll={() => void handleBulkApprove()}
        onClearSelection={() => setRowSelection({})}
      />
    </AdminLayout>
  );
}
