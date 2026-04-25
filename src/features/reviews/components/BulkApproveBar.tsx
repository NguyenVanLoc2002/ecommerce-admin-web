import { CheckCheck, X } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';

interface BulkProgress {
  done: number;
  total: number;
}

interface BulkApproveBarProps {
  selectedCount: number;
  progress: BulkProgress | null;
  onApproveAll: () => void;
  onClearSelection: () => void;
}

export function BulkApproveBar({
  selectedCount,
  progress,
  onApproveAll,
  onClearSelection,
}: BulkApproveBarProps) {
  if (selectedCount === 0 && !progress) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
      <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-lg">
        {progress ? (
          <>
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <span className="tabular-nums font-medium">
                Approving {progress.done} of {progress.total}…
              </span>
              <div className="h-1.5 w-32 overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-full rounded-full bg-success-500 transition-all duration-300"
                  style={{ width: `${(progress.done / progress.total) * 100}%` }}
                />
              </div>
            </div>
          </>
        ) : (
          <>
            <span className="text-sm font-medium text-gray-700">
              {selectedCount} {selectedCount === 1 ? 'review' : 'reviews'} selected
            </span>
            <Button
              size="sm"
              onClick={onApproveAll}
              leftIcon={<CheckCheck className="h-4 w-4" />}
            >
              Approve all
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onClearSelection}
              title="Clear selection"
              aria-label="Clear selection"
            >
              <X className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
