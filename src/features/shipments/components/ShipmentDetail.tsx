import { RefreshCw } from 'lucide-react';
import { StatusBadge } from '@/shared/components/ui/StatusBadge';
import { Button } from '@/shared/components/ui/Button';
import type { ShipmentEvent } from '../types/shipment.types';
import { ShipmentInfoCard } from './ShipmentInfoCard';
import { ShipmentOrderCard } from './ShipmentOrderCard';
import { ShipmentEventTimeline } from './ShipmentEventTimeline';
import type { Shipment } from '../types/shipment.types';

const TERMINAL_STATUSES = ['DELIVERED', 'RETURNED'] as const;

interface ShipmentDetailProps {
  shipment: Shipment;
  events: ShipmentEvent[] | undefined;
  eventsLoading: boolean;
  eventsError: boolean;
  onRetryEvents: () => void;
  onUpdateStatus: () => void;
}

export function ShipmentDetail({
  shipment,
  events,
  eventsLoading,
  eventsError,
  onRetryEvents,
  onUpdateStatus,
}: ShipmentDetailProps) {
  const isTerminal = (TERMINAL_STATUSES as readonly string[]).includes(shipment.status);

  return (
    <>
      {/* Status row */}
      <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">Current status</span>
          <StatusBadge type="shipment" status={shipment.status} />
        </div>
        {!isTerminal && (
          <Button
            size="sm"
            leftIcon={<RefreshCw className="h-4 w-4" />}
            onClick={onUpdateStatus}
          >
            Update Status
          </Button>
        )}
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left — event timeline */}
        <div className="lg:col-span-2">
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <h2 className="mb-4 text-sm font-semibold text-gray-900">Event History</h2>
            <ShipmentEventTimeline
              events={events}
              isLoading={eventsLoading}
              isError={eventsError}
              onRetry={onRetryEvents}
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
