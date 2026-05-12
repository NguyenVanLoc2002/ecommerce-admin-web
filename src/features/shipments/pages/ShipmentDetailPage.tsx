import { ArrowLeft, Truck } from 'lucide-react';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { routes } from '@/constants/routes';
import { EmptyState } from '@/shared/components/feedback/EmptyState';
import { ErrorCard } from '@/shared/components/feedback/ErrorCard';
import { SkeletonDetail } from '@/shared/components/feedback/Skeleton';
import { AdminLayout } from '@/shared/components/layout/AdminLayout';
import { PageHeader } from '@/shared/components/layout/PageHeader';
import { useBreadcrumbLabel } from '@/shared/components/layout';
import { Button } from '@/shared/components/ui/Button';
import { CopyValueButton } from '@/shared/components/ui/CopyValueButton';
import { toast } from '@/shared/stores/uiStore';
import { AppError } from '@/shared/types/api.types';
import {
  getPhase3AdminErrorMessage,
  isConcurrencyErrorCode,
} from '@/shared/utils/adminPhase3Errors';
import { ShipmentDetail } from '../components/ShipmentDetail';
import { ShipmentStatusUpdateModal } from '../components/ShipmentStatusUpdateModal';
import { useShipment } from '../hooks/useShipment';
import { useShipmentEvents } from '../hooks/useShipmentEvents';
import { useUpdateShipmentStatus } from '../hooks/useUpdateShipmentStatus';
import type { UpdateStatusFormValues } from '../schemas/updateStatusSchema';

export function ShipmentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const shipmentId = id ?? '';
  const [statusModalOpen, setStatusModalOpen] = useState(false);

  const { data: shipment, isLoading, isError, refetch } = useShipment(shipmentId);
  const {
    data: events,
    isLoading: eventsLoading,
    isError: eventsError,
    refetch: refetchEvents,
  } = useShipmentEvents(shipmentId);
  const updateStatus = useUpdateShipmentStatus(shipmentId);

  useBreadcrumbLabel(
    routes.shipments.detail(shipmentId),
    isLoading
      ? 'Loading...'
      : (shipment?.shipmentCode
        ?? shipment?.trackingNumber
        ?? (isError ? 'Loading...' : 'Not found')),
  );

  const handleUpdateStatus = async (values: UpdateStatusFormValues) => {
    if (updateStatus.isPending) {
      return;
    }

    try {
      await updateStatus.mutateAsync({ status: values.status, description: values.note });

      if (values.status === 'DELIVERED') {
        toast.success(
          'Shipment delivered. The linked order has been automatically marked as delivered.',
        );
      } else {
        toast.success('Shipment status updated.');
      }

      setStatusModalOpen(false);
    } catch (error) {
      if (error instanceof AppError) {
        toast.error(getPhase3AdminErrorMessage(error, 'Failed to update shipment status.'));

        if (error.code === 'ORDER_STATUS_INVALID' || isConcurrencyErrorCode(error.code)) {
          void refetch();
          void refetchEvents();
        }
      } else {
        toast.error('Failed to update shipment status. Please try again.');
      }
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="p-6">
          <SkeletonDetail />
        </div>
      </AdminLayout>
    );
  }

  if (isError) {
    return (
      <AdminLayout>
        <div className="p-6">
          <ErrorCard onRetry={() => void refetch()} />
        </div>
      </AdminLayout>
    );
  }

  if (!shipment) {
    return (
      <AdminLayout>
        <div className="p-6">
          <EmptyState
            icon={<Truck className="h-10 w-10" />}
            title="Shipment not found"
            message="This shipment doesn't exist or has been removed."
            action={{ label: 'Back to Shipments', onClick: () => navigate(routes.shipments.list) }}
          />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6 p-6">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => navigate(routes.shipments.list)}
            aria-label="Back to shipments"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <PageHeader
            title={shipment.shipmentCode || shipment.trackingNumber || 'Shipment Details'}
            description={
              shipment.carrier
                ? `Order #${shipment.orderCode} - ${shipment.carrier}`
                : `Order #${shipment.orderCode}`
            }
            actions={<CopyValueButton value={shipment.id} label="Copy ID" />}
          />
        </div>

        <ShipmentDetail
          shipment={shipment}
          events={events}
          eventsLoading={eventsLoading}
          eventsError={eventsError}
          onRetryEvents={() => void refetchEvents()}
          onUpdateStatus={() => setStatusModalOpen(true)}
        />
      </div>

      <ShipmentStatusUpdateModal
        open={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        currentStatus={shipment.status}
        isSubmitting={updateStatus.isPending}
        onSubmit={(values) => void handleUpdateStatus(values)}
      />
    </AdminLayout>
  );
}
