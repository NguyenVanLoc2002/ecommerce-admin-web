import { useEffect, useState } from 'react';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { useConfirmDialog } from '@/shared/hooks/useConfirmDialog';
import { toast } from '@/shared/stores/uiStore';
import { AppError } from '@/shared/types/api.types';
import { useDeleteVariant } from '../hooks/useDeleteVariant';
import type { ProductVariant } from '../types/product.types';

interface VariantRowActionsProps {
  productId: number;
  variant: ProductVariant;
  onEdit: (variant: ProductVariant) => void;
}

export function VariantRowActions({ productId, variant, onEdit }: VariantRowActionsProps) {
  const { confirm } = useConfirmDialog();
  const deleteVariant = useDeleteVariant(productId);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  const handleDelete = async () => {
    setMenuOpen(false);
    const ok = await confirm({
      title: 'Delete variant?',
      description: `"${variant.variantName}" (${variant.sku}) will be permanently deleted.`,
      confirmLabel: 'Delete',
      variant: 'destructive',
    });
    if (!ok) return;

    try {
      await deleteVariant.mutateAsync(variant.id);
      toast.success('Variant deleted.');
    } catch (err) {
      if (err instanceof AppError) {
        if (err.code === 'CONFLICT') {
          toast.error('Cannot delete variant with active inventory reservations.');
        } else {
          toast.error(err.message);
        }
      } else {
        toast.error('Failed to delete variant. Please try again.');
      }
    }
  };

  return (
    <div className="relative flex justify-end">
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => setMenuOpen((v) => !v)}
        aria-label="Row actions"
      >
        <MoreHorizontal className="h-4 w-4" />
      </Button>

      {menuOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
          <div className="absolute right-0 z-50 mt-8 w-36 rounded-md border border-gray-200 bg-white shadow-md">
            <button
              type="button"
              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
              onClick={() => {
                setMenuOpen(false);
                onEdit(variant);
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
          </div>
        </>
      )}
    </div>
  );
}
