import { useNavigate } from 'react-router-dom';
import { Eye } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { routes } from '@/constants/routes';
import type { PaymentSummary } from '../types/payment.types';

interface PaymentRowActionsProps {
  payment: PaymentSummary;
}

export function PaymentRowActions({ payment }: PaymentRowActionsProps) {
  const navigate = useNavigate();

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      onClick={() => navigate(routes.payments.detail(payment.id))}
      aria-label="View payment"
    >
      <Eye className="h-4 w-4" />
    </Button>
  );
}
