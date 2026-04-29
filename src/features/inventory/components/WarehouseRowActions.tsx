import { useRef, useState } from 'react';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { DropdownMenu } from '@/shared/components/ui/DropdownMenu';
import { useConfirmDialog } from '@/shared/hooks/useConfirmDialog';
import { toast } from '@/shared/stores/uiStore';
import { AppError } from '@/shared/types/api.types';
import { useDeleteWarehouse } from '../hooks/useDeleteWarehouse';
import type { Warehouse } from '../types/inventory.types';

interface WarehouseRowActionsProps {
  warehouse: Warehouse;
  onEdit: (warehouse: Warehouse) => void;
}

export function WarehouseRowActions({ warehouse, onEdit }: WarehouseRowActionsProps) {
  const { confirm } = useConfirmDialog();
  const deleteWarehouse = useDeleteWarehouse();
  const [menuOpen, setMenuOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleDelete = async () => {
    setMenuOpen(false);
    const ok = await confirm({
      title: 'Delete warehouse?',
      description: `"${warehouse.name}" will be removed. This action cannot be undone.`,
      confirmLabel: 'Delete',
      variant: 'destructive',
    });
    if (!ok) return;

    try {
      await deleteWarehouse.mutateAsync(warehouse.id);
      toast.success('Warehouse deleted.');
    } catch (err) {
      if (err instanceof AppError) {
        toast.error(err.message);
      } else {
        toast.error('Failed to delete warehouse. Please try again.');
      }
    }
  };

  return (
    <div className="relative flex justify-end">
      <Button
        ref={buttonRef}
        variant="ghost"
        size="icon-sm"
        onClick={() => setMenuOpen((v) => !v)}
        aria-label="Row actions"
        aria-haspopup="menu"
        aria-expanded={menuOpen}
      >
        <MoreHorizontal className="h-4 w-4" />
      </Button>

      <DropdownMenu open={menuOpen} anchorRef={buttonRef} onClose={() => setMenuOpen(false)} width={160}>
        <button
          type="button"
          className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
          onClick={() => {
            setMenuOpen(false);
            onEdit(warehouse);
          }}
        >
          <Pencil className="h-4 w-4 text-gray-400" />
          Edit
        </button>
        <div className="my-1 border-t border-gray-100" />
        <button
          type="button"
          className="flex w-full items-center gap-2 px-3 py-2 text-sm text-danger-600 hover:bg-danger-50"
          onClick={() => void handleDelete()}
        >
          <Trash2 className="h-4 w-4" />
          Delete
        </button>
      </DropdownMenu>
    </div>
  );
}
