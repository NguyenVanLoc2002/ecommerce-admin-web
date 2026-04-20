import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { AdminLayout } from '@/shared/components/layout/AdminLayout';
import { PageHeader } from '@/shared/components/layout/PageHeader';
import { Button } from '@/shared/components/ui/Button';
import { toast } from '@/shared/stores/uiStore';
import { AppError } from '@/shared/types/api.types';
import { routes } from '@/constants/routes';
import { useCreateShipment } from '../hooks/useCreateShipment';
import { CreateShipmentForm } from '../components/CreateShipmentForm';
import type { CreateShipmentFormValues } from '../schemas/createShipmentSchema';

export function CreateShipmentPage() {
  const navigate = useNavigate();
  const createShipment = useCreateShipment();

  const handleSubmit = async (values: CreateShipmentFormValues) => {
    try {
      const shipment = await createShipment.mutateAsync({
        orderId: values.orderId,
        carrier: values.carrier ?? null,
        trackingNumber: values.trackingNumber ?? null,
        estimatedDeliveryDate: values.estimatedDeliveryDate ?? null,
        note: values.notes ?? null,
      });
      toast.success('Shipment created. The order has been advanced to Shipped.');
      navigate(routes.shipments.detail(shipment.id));
    } catch (err) {
      if (err instanceof AppError) {
        // Field-level errors are handled inside CreateShipmentForm via the thrown error;
        // only non-field errors are toasted here.
        if (!err.fieldErrors?.length) {
          if (err.code === 'ORDER_NOT_FOUND') {
            toast.error('Order not found. Please check the Order ID.');
          } else if (err.code === 'SHIPMENT_ALREADY_EXISTS') {
            toast.error('A shipment already exists for this order.');
          } else {
            toast.error(err.message || 'Failed to create shipment. Please try again.');
          }
        }
      } else {
        toast.error('Failed to create shipment. Please try again.');
      }
    }
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

        <div className="mx-auto max-w-lg">
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <CreateShipmentForm
              isSubmitting={createShipment.isPending}
              onSubmit={(values) => void handleSubmit(values)}
              onCancel={() => navigate(routes.shipments.list)}
            />
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
