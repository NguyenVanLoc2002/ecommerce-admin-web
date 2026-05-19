import { Badge } from '@/shared/components/ui/Badge';

type ConnectionVariant = 'default' | 'success' | 'danger';

function normalizeStatus(status: string | null | undefined) {
  return status?.trim().toUpperCase() ?? '';
}

export function getCarrierConnectionPresentation(status: string | null | undefined): {
  label: string;
  variant: ConnectionVariant;
} {
  switch (normalizeStatus(status)) {
    case 'CONNECTED':
      return { label: 'Connected', variant: 'success' };
    case 'FAILED':
      return { label: 'Failed', variant: 'danger' };
    case 'NOT_CONFIGURED':
      return { label: 'Not configured', variant: 'default' };
    default:
      return { label: 'Not checked', variant: 'default' };
  }
}

interface CarrierConnectionBadgeProps {
  status: string | null | undefined;
}

export function CarrierConnectionBadge({ status }: CarrierConnectionBadgeProps) {
  const presentation = getCarrierConnectionPresentation(status);

  return (
    <Badge variant={presentation.variant} dot>
      {presentation.label}
    </Badge>
  );
}
