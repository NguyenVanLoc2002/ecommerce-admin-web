import { useEffect, useRef, useState } from 'react';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { DropdownMenu } from '@/shared/components/ui/DropdownMenu';
import { useConfirmDialog } from '@/shared/hooks/useConfirmDialog';
import { toast } from '@/shared/stores/uiStore';
import { AppError } from '@/shared/types/api.types';
import { useDeleteBrand } from '../hooks/useDeleteBrand';
import type { Brand } from '../types/brand.types';

interface BrandRowActionsProps {
  brand: Brand;
  onEdit: (brand: Brand) => void;
}

export function BrandRowActions({ brand, onEdit }: BrandRowActionsProps) {
  const { confirm } = useConfirmDialog();
  const deleteBrand = useDeleteBrand();
  const [menuOpen, setMenuOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

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
      title: 'Delete brand?',
      description: `"${brand.name}" will be marked as deleted and hidden from active lists.`,
      confirmLabel: 'Delete',
      variant: 'destructive',
    });
    if (!ok) return;

    try {
      await deleteBrand.mutateAsync(brand.id);
      toast.success('Brand deleted successfully.');
    } catch (err) {
      if (err instanceof AppError) {
        toast.error(err.message);
      } else {
        toast.error('Failed to delete brand. Please try again.');
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
            onEdit(brand);
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
