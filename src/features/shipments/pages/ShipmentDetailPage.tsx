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
import { CancelShipmentProviderModal } from '../components/CancelShipmentProviderModal';
import { ShipmentDetail } from '../components/ShipmentDetail';
import { ShipmentEditModal } from '../components/ShipmentEditModal';
import { ShipmentStatusUpdateModal } from '../components/ShipmentStatusUpdateModal';
import { useCancelShipmentProvider } from '../hooks/useCancelShipmentProvider';
import { useShipment } from '../hooks/useShipment';
import { useSyncShipmentProvider } from '../hooks/useSyncShipmentProvider';
import { useUpdateShipment } from '../hooks/useUpdateShipment';
import { useUpdateShipmentStatus } from '../hooks/useUpdateShipmentStatus';
import type { CancelShipmentProviderFormValues } from '../schemas/cancelShipmentProviderSchema';
import type { CreateShipmentFormValues } from '../schemas/createShipmentSchema';
import type { UpdateStatusFormValues } from '../schemas/updateStatusSchema';
import { mapShipmentFormToUpdateRequest } from '../utils/shipmentPayload';

export function ShipmentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const shipmentId = id ?? '';
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [cancelProviderOpen, setCancelProviderOpen] = useState(false);

  const { data: shipment, isLoading, isError, refetch } = useShipment(shipmentId);
  const updateStatus = useUpdateShipmentStatus(shipmentId);
  const updateShipment = useUpdateShipment(shipmentId);
  const syncProvider = useSyncShipmentProvider(shipmentId);
  const cancelProvider = useCancelShipmentProvider(shipmentId);

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
        }
      } else {
        toast.error('Failed to update shipment status. Please try again.');
      }
    }
  };

  const handleEditShipment = async (values: CreateShipmentFormValues) => {
    try {
      await updateShipment.mutateAsync(mapShipmentFormToUpdateRequest(values));
      toast.success('Shipment details updated.');
      setEditModalOpen(false);
    } catch (error) {
      if (
        error instanceof AppError &&
        (error.code === 'SHIPMENT_ALREADY_EXISTS' || isConcurrencyErrorCode(error.code))
      ) {
        void refetch();
      }

      throw error;
    }
  };

  const handleSyncProvider = async () => {
    if (syncProvider.isPending) {
      return;
    }

    try {
      await syncProvider.mutateAsync();
      toast.success('Shipment provider status synced.');
    } catch (error) {
      if (error instanceof AppError) {
        toast.error(getPhase3AdminErrorMessage(error, 'Failed to sync provider shipment.'));
      } else {
        toast.error('Failed to sync provider shipment. Please try again.');
      }
    }
  };

  const handleCancelProvider = async (values: CancelShipmentProviderFormValues) => {
    if (cancelProvider.isPending) {
      return;
    }

    try {
      await cancelProvider.mutateAsync({ reason: values.reason });
      toast.success('Provider shipment cancelled.');
      setCancelProviderOpen(false);
    } catch (error) {
      if (error instanceof AppError) {
        toast.error(getPhase3AdminErrorMessage(error, 'Failed to cancel provider shipment.'));
      } else {
        toast.error('Failed to cancel provider shipment. Please try again.');
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
          onEdit={() => setEditModalOpen(true)}
          onUpdateStatus={() => setStatusModalOpen(true)}
          onSyncProvider={() => void handleSyncProvider()}
          onCancelProvider={() => setCancelProviderOpen(true)}
          providerSyncPending={syncProvider.isPending}
          providerCancelPending={cancelProvider.isPending}
        />
      </div>

      <ShipmentEditModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        shipment={shipment}
        isSubmitting={updateShipment.isPending}
        onSubmit={handleEditShipment}
      />

      <ShipmentStatusUpdateModal
        open={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        currentStatus={shipment.status}
        isSubmitting={updateStatus.isPending}
        onSubmit={(values) => void handleUpdateStatus(values)}
      />

      <CancelShipmentProviderModal
        open={cancelProviderOpen}
        onClose={() => setCancelProviderOpen(false)}
        isSubmitting={cancelProvider.isPending}
        onSubmit={(values) => void handleCancelProvider(values)}
      />
    </AdminLayout>
  );
}
