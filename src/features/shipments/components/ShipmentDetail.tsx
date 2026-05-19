import { Ban, Pencil, RefreshCw, RotateCw } from 'lucide-react';
import { StatusBadge } from '@/shared/components/ui/StatusBadge';
import { Button } from '@/shared/components/ui/Button';
import { ShipmentInfoCard } from './ShipmentInfoCard';
import { ShipmentOrderCard } from './ShipmentOrderCard';
import { ShipmentEventTimeline } from './ShipmentEventTimeline';
import type { Shipment } from '../types/shipment.types';

const TERMINAL_STATUSES = ['DELIVERED', 'RETURNED'] as const;

interface ShipmentDetailProps {
  shipment: Shipment;
  onEdit: () => void;
  onUpdateStatus: () => void;
  onSyncProvider: () => void;
  onCancelProvider: () => void;
  providerSyncPending: boolean;
  providerCancelPending: boolean;
}

export function ShipmentDetail({
  shipment,
  onEdit,
  onUpdateStatus,
  onSyncProvider,
  onCancelProvider,
  providerSyncPending,
  providerCancelPending,
}: ShipmentDetailProps) {
  const isTerminal = (TERMINAL_STATUSES as readonly string[]).includes(shipment.status);
  const isProviderBacked =
    shipment.carrierId !== null &&
    shipment.carrierProviderType !== null &&
    shipment.carrierProviderType !== 'MANUAL';

  return (
    <>
      {/* Status row */}
      <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">Current status</span>
          <StatusBadge type="shipment" status={shipment.status} />
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            leftIcon={<Pencil className="h-4 w-4" />}
            onClick={onEdit}
          >
            Edit details
          </Button>
          {!isTerminal && (
            <Button
              size="sm"
              leftIcon={<RefreshCw className="h-4 w-4" />}
              onClick={onUpdateStatus}
            >
              Update Status
            </Button>
          )}
          {isProviderBacked && (
            <Button
              size="sm"
              variant="secondary"
              leftIcon={<RotateCw className="h-4 w-4" />}
              onClick={onSyncProvider}
              isLoading={providerSyncPending}
              disabled={providerCancelPending}
            >
              Sync Provider
            </Button>
          )}
          {isProviderBacked && (
            <Button
              size="sm"
              variant="danger"
              leftIcon={<Ban className="h-4 w-4" />}
              onClick={onCancelProvider}
              isLoading={providerCancelPending}
              disabled={providerSyncPending}
            >
              Cancel Provider
            </Button>
          )}
        </div>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left — event timeline */}
        <div className="lg:col-span-2">
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <h2 className="mb-4 text-sm font-semibold text-gray-900">Event History</h2>
            <ShipmentEventTimeline
              events={shipment.events}
              isLoading={false}
              isError={false}
              onRetry={onSyncProvider}
            />
          </div>
        </div>

        {/* Right sidebar */}
        <div className="space-y-4">
          <ShipmentInfoCard shipment={shipment} />
          <ShipmentOrderCard shipment={shipment} />
        </div>
      </div>
    </>
  );
}
