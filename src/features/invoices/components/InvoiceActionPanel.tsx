import { CheckCircle, Ban } from 'lucide-react';
import { StatusBadge } from '@/shared/components/ui/StatusBadge';
import { Button } from '@/shared/components/ui/Button';
import type { InvoiceStatus } from '../types/invoice.types';

interface InvoiceActionPanelProps {
  status: InvoiceStatus;
  isMarkingPaid: boolean;
  isVoiding: boolean;
  onMarkPaid: () => void;
  onVoid: () => void;
}

export function InvoiceActionPanel({
  status,
  isMarkingPaid,
  isVoiding,
  onMarkPaid,
  onVoid,
}: InvoiceActionPanelProps) {
  const isIssued = status === 'ISSUED';

  return (
    <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3">
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-500">Status</span>
        <StatusBadge type="invoice" status={status} />
      </div>

      {isIssued && (
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            leftIcon={<CheckCircle className="h-4 w-4" />}
            isLoading={isMarkingPaid}
            disabled={isVoiding}
            onClick={onMarkPaid}
          >
            Mark as Paid
          </Button>
          <Button
            variant="danger"
            size="sm"
            leftIcon={<Ban className="h-4 w-4" />}
            isLoading={isVoiding}
            disabled={isMarkingPaid}
            onClick={onVoid}
          >
            Void Invoice
          </Button>
        </div>
      )}
    </div>
  );
}
