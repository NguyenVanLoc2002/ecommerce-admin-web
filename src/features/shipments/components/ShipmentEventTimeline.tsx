import {
  Truck,
  MapPin,
  Package,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Clock,
} from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import { SkeletonTimeline } from '@/shared/components/feedback/Skeleton';
import { ErrorCard } from '@/shared/components/feedback/ErrorCard';
import { EmptyState } from '@/shared/components/feedback/EmptyState';
import { formatDateTime } from '@/shared/utils/formatDate';
import type { ShipmentStatus } from '@/shared/types/enums';
import type { ShipmentEvent } from '../types/shipment.types';

type EventStyle = {
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  lineBg: string;
};

const EVENT_STYLE: Record<ShipmentStatus, EventStyle> = {
  PENDING: {
    icon: <Clock className="h-4 w-4" />,
    iconBg: 'bg-warning-100',
    iconColor: 'text-warning-600',
    lineBg: 'bg-gray-200',
  },
  IN_TRANSIT: {
    icon: <Truck className="h-4 w-4" />,
    iconBg: 'bg-primary-100',
    iconColor: 'text-primary-600',
    lineBg: 'bg-primary-200',
  },
  OUT_FOR_DELIVERY: {
    icon: <MapPin className="h-4 w-4" />,
    iconBg: 'bg-info-100',
    iconColor: 'text-info-600',
    lineBg: 'bg-info-200',
  },
  DELIVERED: {
    icon: <CheckCircle2 className="h-4 w-4" />,
    iconBg: 'bg-success-100',
    iconColor: 'text-success-600',
    lineBg: 'bg-success-200',
  },
  FAILED: {
    icon: <XCircle className="h-4 w-4" />,
    iconBg: 'bg-danger-100',
    iconColor: 'text-danger-600',
    lineBg: 'bg-danger-200',
  },
  RETURNED: {
    icon: <RotateCcw className="h-4 w-4" />,
    iconBg: 'bg-gray-100',
    iconColor: 'text-gray-500',
    lineBg: 'bg-gray-200',
  },
};

const STATUS_LABELS: Record<ShipmentStatus, string> = {
  PENDING: 'Shipment Created',
  IN_TRANSIT: 'In Transit',
  OUT_FOR_DELIVERY: 'Out for Delivery',
  DELIVERED: 'Delivered',
  FAILED: 'Delivery Failed',
  RETURNED: 'Returned to Sender',
};

interface ShipmentEventTimelineProps {
  events: ShipmentEvent[] | undefined;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
}

export function ShipmentEventTimeline({
  events,
  isLoading,
  isError,
  onRetry,
}: ShipmentEventTimelineProps) {
  if (isLoading) return <SkeletonTimeline items={4} />;
  if (isError) return <ErrorCard onRetry={onRetry} className="py-8" />;
  if (!events || events.length === 0) {
    return (
      <EmptyState
        icon={<Package className="h-8 w-8" />}
        title="No events yet"
        message="Status history will appear here."
        className="py-8"
      />
    );
  }

  // Most recent first
  const sorted = [...events].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {sorted.map((event, index) => {
          const style = EVENT_STYLE[event.status];
          const isLast = index === sorted.length - 1;

          return (
            <li key={event.id}>
              <div className="relative pb-8">
                {!isLast && (
                  <span
                    className={cn('absolute left-4 top-4 -ml-px h-full w-0.5', style.lineBg)}
                    aria-hidden
                  />
                )}
                <div className="relative flex items-start gap-3">
                  {/* Icon */}
                  <div
                    className={cn(
                      'flex h-8 w-8 shrink-0 items-center justify-center rounded-full ring-4 ring-white',
                      style.iconBg,
                      style.iconColor,
                    )}
                  >
                    {style.icon}
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1 pt-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="text-sm font-semibold text-gray-900">
                        {STATUS_LABELS[event.status]}
                      </p>
                      <time className="shrink-0 text-xs text-gray-400 whitespace-nowrap">
                        {formatDateTime(event.createdAt)}
                      </time>
                    </div>
                    {event.note && (
                      <p className="mt-0.5 text-sm text-gray-600">{event.note}</p>
                    )}
                    {event.createdBy && (
                      <p className="mt-0.5 text-xs text-gray-400">by {event.createdBy}</p>
                    )}
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
