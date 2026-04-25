import { useNavigate } from 'react-router-dom';
import { Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { useConfirmDialog } from '@/shared/hooks/useConfirmDialog';
import { toast } from '@/shared/stores/uiStore';
import { usePermission } from '@/constants/permissions';
import { routes } from '@/constants/routes';
import type { PromotionSummary } from '../types/promotion.types';
import { useDeletePromotion } from '../hooks/useDeletePromotion';

interface PromotionRowActionsProps {
  promotion: PromotionSummary;
}

export function PromotionRowActions({ promotion }: PromotionRowActionsProps) {
  const navigate = useNavigate();
  const { confirm } = useConfirmDialog();
  const canWrite = usePermission('promotions', 'write');
  const deletePromotion = useDeletePromotion();

  const handleDelete = async () => {
    const ok = await confirm({
      title: 'Delete promotion?',
      description:
        'This will deactivate the promotion. Existing vouchers remain valid until their own expiry.',
      confirmLabel: 'Delete',
      variant: 'destructive',
    });
    if (!ok) return;

    deletePromotion.mutate(promotion.id, {
      onSuccess: () => {
        toast.success('Promotion deleted.');
      },
      onError: (error) => {
        toast.error(error.message ?? 'Failed to delete promotion.');
      },
    });
  };

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => navigate(routes.promotions.edit(promotion.id))}
        disabled={!canWrite}
        title={canWrite ? 'Edit promotion' : 'Requires Admin role'}
        aria-label="Edit promotion"
      >
        <Pencil className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => void handleDelete()}
        disabled={!canWrite || deletePromotion.isPending}
        title={canWrite ? 'Delete promotion' : 'Requires Admin role'}
        aria-label="Delete promotion"
      >
        <Trash2 className="h-4 w-4 text-danger-500" />
      </Button>
    </div>
  );
}
