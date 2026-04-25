import { useNavigate } from 'react-router-dom';
import { Pencil, Trash2, ReceiptText } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { useConfirmDialog } from '@/shared/hooks/useConfirmDialog';
import { toast } from '@/shared/stores/uiStore';
import { usePermission } from '@/constants/permissions';
import { routes } from '@/constants/routes';
import type { Voucher } from '../types/voucher.types';
import { useDeleteVoucher } from '../hooks/useDeleteVoucher';

interface VoucherRowActionsProps {
  voucher: Voucher;
}

export function VoucherRowActions({ voucher }: VoucherRowActionsProps) {
  const navigate = useNavigate();
  const { confirm } = useConfirmDialog();
  const canWrite = usePermission('vouchers', 'write');
  const deleteVoucher = useDeleteVoucher();

  const handleDelete = async () => {
    const ok = await confirm({
      title: 'Delete voucher?',
      description: 'Customers holding this code will not be able to redeem it.',
      confirmLabel: 'Delete',
      variant: 'destructive',
    });
    if (!ok) return;

    deleteVoucher.mutate(voucher.id, {
      onSuccess: () => {
        toast.success('Voucher deleted.');
      },
      onError: (error) => {
        toast.error(error.message ?? 'Failed to delete voucher.');
      },
    });
  };

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => navigate(routes.vouchers.usages(voucher.id))}
        title="View usages"
        aria-label="View voucher usages"
      >
        <ReceiptText className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => navigate(routes.vouchers.edit(voucher.id))}
        disabled={!canWrite}
        title={canWrite ? 'Edit voucher' : 'Requires Admin role'}
        aria-label="Edit voucher"
      >
        <Pencil className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => void handleDelete()}
        disabled={!canWrite || deleteVoucher.isPending}
        title={canWrite ? 'Delete voucher' : 'Requires Admin role'}
        aria-label="Delete voucher"
      >
        <Trash2 className="h-4 w-4 text-danger-500" />
      </Button>
    </div>
  );
}
