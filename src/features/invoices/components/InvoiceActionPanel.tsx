import { PencilLine } from 'lucide-react';
import { StatusBadge } from '@/shared/components/ui/StatusBadge';
import { Button } from '@/shared/components/ui/Button';
import type { InvoiceStatus } from '../types/invoice.types';

interface InvoiceActionPanelProps {
  status: InvoiceStatus;
  isUpdatingStatus: boolean;
  onUpdateStatus: () => void;
}

export function InvoiceActionPanel({
  status,
  isUpdatingStatus,
  onUpdateStatus,
}: InvoiceActionPanelProps) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3">
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-500">Status</span>
        <StatusBadge type="invoice" status={status} />
      </div>

      <Button
        size="sm"
        leftIcon={<PencilLine className="h-4 w-4" />}
        isLoading={isUpdatingStatus}
        onClick={onUpdateStatus}
      >
        Update status
      </Button>
    </div>
  );
}
