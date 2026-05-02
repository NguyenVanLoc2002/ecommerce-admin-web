import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { AdminLayout } from '@/shared/components/layout/AdminLayout';
import { PageHeader } from '@/shared/components/layout/PageHeader';
import { useTableFilters } from '@/shared/hooks/useTableFilters';
import { toast } from '@/shared/stores/uiStore';
import { SoftDeleteState } from '@/shared/types/api.types';
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
  productId: undefined,
  customerId: undefined,
  minRating: undefined,
  maxRating: undefined,
  deletedState: SoftDeleteState.ACTIVE,
};

interface BulkProgress {
  done: number;
  total: number;
}

export function ReviewModerationPage() {
  const [filters, setFilters] = useTableFilters<ReviewListParams>(DEFAULT_FILTERS, {
    numberKeys: ['minRating', 'maxRating'],
  });
  const [selectedId, setSelectedId] = useState<string | undefined>();
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [rejectTarget, setRejectTarget] = useState<Review | null>(null);
  const [bulkProgress, setBulkProgress] = useState<BulkProgress | null>(null);
  const detailPanelRef = useRef<HTMLDivElement | null>(null);

  const { data, isLoading, isError, refetch } = usePendingReviews(filters);

  const {
    data: selectedReview,
    isLoading: detailLoading,
    isError: detailError,
    refetch: refetchDetail,
  } = useReview(selectedId);

  const approveReview = useApproveReview();

  const selectedIds = Object.entries(rowSelection)
    .filter(([, value]) => value)
    .map(([id]) => id);

  useEffect(() => {
    const items = data?.items ?? [];

    if (items.length === 0) {
      if (selectedId) {
        setSelectedId(undefined);
      }
      return;
    }

    const hasSelectedReview = selectedId
      ? items.some((review) => review.id === selectedId)
      : false;

    if (!hasSelectedReview) {
      setSelectedId(items[0].id);
    }
  }, [data?.items, selectedId]);

  const handleRowClick = (review: Review) => {
    setSelectedId(review.id);
    requestAnimationFrame(() => {
      detailPanelRef.current?.focus();
    });
  };

  const handleReject = (review: Review) => {
    setRejectTarget(review);
  };

  const handleKeyboardApprove = () => {
    if (!selectedReview || selectedReview.status !== 'PENDING') {
      return;
    }

    approveReview.mutate(
      { id: selectedReview.id },
      { onSuccess: () => toast.success('Review approved.') },
    );
  };

  const handleDetailPanelKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!selectedReview) {
      return;
    }

    if (event.key === 'a' || event.key === 'A') {
      event.preventDefault();
      handleKeyboardApprove();
    }

    if ((event.key === 'r' || event.key === 'R') && !rejectTarget) {
      if (selectedReview.status === 'PENDING') {
        event.preventDefault();
        setRejectTarget(selectedReview);
      }
    }
  };

  const handleBulkApprove = async () => {
    const ids = [...selectedIds];
    setBulkProgress({ done: 0, total: ids.length });

    let successCount = 0;
    for (let i = 0; i < ids.length; i++) {
      try {
        await approveReview.mutateAsync({ id: ids[i] });
        successCount++;
      } catch {
        // Keep processing the remaining items. Hook-level toast handles failures.
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
      <div className="flex h-full flex-col space-y-4 p-6">
        <PageHeader
          title="Review Moderation"
          description="Approve or reject customer reviews before they appear on the storefront."
        />

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
          <ReviewTable
            data={data}
            isLoading={isLoading}
            isError={isError}
            onRetry={() => void refetch()}
            filters={filters}
            onFiltersChange={setFilters}
            rowSelection={rowSelection}
            onRowSelectionChange={setRowSelection}
            activeRowId={selectedId}
            onRowClick={handleRowClick}
            onReject={handleReject}
          />

          <div
            ref={detailPanelRef}
            tabIndex={selectedReview ? 0 : -1}
            onKeyDown={handleDetailPanelKeyDown}
            className="sticky top-6 min-h-[300px] rounded-lg border border-gray-200 bg-white p-5 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <ReviewDetail
              review={selectedReview}
              isLoading={detailLoading}
              isError={detailError}
              onRetry={() => void refetchDetail()}
              onReject={handleReject}
              recordStatus={selectedReview?.isDeleted}
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
