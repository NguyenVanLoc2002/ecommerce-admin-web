import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { routes } from '@/constants/routes';
import { AdminLayout } from '@/shared/components/layout/AdminLayout';
import { PageHeader } from '@/shared/components/layout/PageHeader';
import { Button } from '@/shared/components/ui/Button';
import { MomoIntegrationCard } from '../components/MomoIntegrationCard';
import { PaypalIntegrationCard } from '../components/PaypalIntegrationCard';

export function PaymentIntegrationsPage() {
  const navigate = useNavigate();

  return (
    <AdminLayout>
      <div className="space-y-6 p-6">
        <PageHeader
          title="Payment Integrations"
          description="Manage the effective admin-side runtime configuration for MoMo and PayPal."
          actions={
            <Button
              variant="secondary"
              onClick={() => navigate(routes.payments.list)}
              leftIcon={<ArrowLeft className="h-4 w-4" />}
            >
              Back to payments
            </Button>
          }
        />

        <div className="grid gap-6">
          <MomoIntegrationCard />
          <PaypalIntegrationCard />
        </div>
      </div>
    </AdminLayout>
  );
}
