import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Truck } from 'lucide-react';
import { AdminLayout } from '@/shared/components/layout/AdminLayout';
import { PageHeader } from '@/shared/components/layout/PageHeader';
import { Button } from '@/shared/components/ui/Button';
import { SkeletonDetail } from '@/shared/components/feedback/Skeleton';
import { ErrorCard } from '@/shared/components/feedback/ErrorCard';
import { EmptyState } from '@/shared/components/feedback/EmptyState';
import { toast } from '@/shared/stores/uiStore';
import { AppError } from '@/shared/types/api.types';
import { routes } from '@/constants/routes';
import { useShipment } from '../hooks/useShipment';
import { useShipmentEvents } from '../hooks/useShipmentEvents';
import { useUpdateShipmentStatus } from '../hooks/useUpdateShipmentStatus';
import { ShipmentDetail } from '../components/ShipmentDetail';
import { ShipmentStatusUpdateModal } from '../components/ShipmentStatusUpdateModal';
import type { UpdateStatusFormValues } from '../schemas/updateStatusSchema';

export function ShipmentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const shipmentId = Number(id);
  const [statusModalOpen, setStatusModalOpen] = useState(false);

  const { data: shipment, isLoading, isError, refetch } = useShipment(shipmentId);
  const {
    data: events,
    isLoading: eventsLoading,
    isError: eventsError,
    refetch: refetchEvents,
  } = useShipmentEvents(shipmentId);
  const updateStatus = useUpdateShipmentStatus(shipmentId);

  const handleUpdateStatus = async (values: UpdateStatusFormValues) => {
    try {
      await updateStatus.mutateAsync({ status: values.status, note: values.note });

      if (values.status === 'DELIVERED') {
        toast.success('Shipment delivered. The linked order has been automatically marked as delivered.');
      } else {
        toast.success('Shipment status updated.');
      }

      setStatusModalOpen(false);
    } catch (err) {
      if (err instanceof AppError) {
        if (err.code === 'ORDER_STATUS_INVALID') {
          toast.error('Shipment was updated by another user. Refreshing…');
          setTimeout(() => void refetch(), 1_000);
        } else {
          toast.error(err.message || 'Failed to update shipment status.');
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
            title={shipment.trackingCode ?? `Shipment #${shipment.id}`}
            description={`Order #${shipment.orderCode}`}
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
