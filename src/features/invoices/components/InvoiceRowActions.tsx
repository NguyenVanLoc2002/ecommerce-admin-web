import { Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/shared/components/ui/Button';
import { routes } from '@/constants/routes';
import type { InvoiceSummary } from '../types/invoice.types';

interface InvoiceRowActionsProps {
  invoice: InvoiceSummary;
}

export function InvoiceRowActions({ invoice }: InvoiceRowActionsProps) {
  const navigate = useNavigate();

  return (
    <div className="flex items-center gap-1" onClick={(event) => event.stopPropagation()}>
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => navigate(routes.invoices.detail(invoice.id))}
        aria-label="View invoice"
        title="View invoice"
      >
        <Eye className="h-4 w-4" />
      </Button>
    </div>
  );
}
