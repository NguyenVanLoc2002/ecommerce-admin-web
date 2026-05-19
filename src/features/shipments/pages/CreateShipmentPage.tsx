import { ArrowLeft } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { routes } from '@/constants/routes';
import { AdminLayout } from '@/shared/components/layout/AdminLayout';
import { PageHeader } from '@/shared/components/layout/PageHeader';
import { Button } from '@/shared/components/ui/Button';
import { toast } from '@/shared/stores/uiStore';
import { useCreateShipment } from '../hooks/useCreateShipment';
import { useShipmentOrderReference } from '../hooks/useShipmentOrderReference';
import { CreateShipmentForm } from '../components/CreateShipmentForm';
import type { CreateShipmentFormValues } from '../schemas/createShipmentSchema';
import { mapShipmentFormToCreateRequest } from '../utils/shipmentPayload';

export function CreateShipmentPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId') ?? undefined;
  const createShipment = useCreateShipment();
  const {
    data: order,
    isLoading: orderLoading,
  } = useShipmentOrderReference(orderId);

  const handleSubmit = async (values: CreateShipmentFormValues) => {
    if (createShipment.isPending) {
      return;
    }

    const shipment = await createShipment.mutateAsync(mapShipmentFormToCreateRequest(values));

    toast.success('Shipment created. The order has been advanced to Shipped.');
    navigate(routes.shipments.detail(shipment.id));
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="mb-6 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => navigate(routes.shipments.list)}
            aria-label="Back to shipments"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <PageHeader
            title="New Shipment"
            description="Create a shipment for an existing order."
          />
        </div>

        <div className="mx-auto max-w-2xl">
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <CreateShipmentForm
              defaultOrderId={orderId}
              order={order}
              orderLoading={orderLoading}
              isSubmitting={createShipment.isPending}
              onSubmit={handleSubmit}
              onCancel={() => navigate(routes.shipments.list)}
            />
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
