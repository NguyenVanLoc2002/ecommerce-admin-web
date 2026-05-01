import { useEffect, useRef, useState } from 'react';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { DropdownMenu } from '@/shared/components/ui/DropdownMenu';
import { useConfirmDialog } from '@/shared/hooks/useConfirmDialog';
import { toast } from '@/shared/stores/uiStore';
import { AppError } from '@/shared/types/api.types';
import { useDeleteProductAttribute } from '../hooks/useDeleteProductAttribute';
import type { ProductAttribute } from '../types/productAttribute.types';

interface ProductAttributeRowActionsProps {
  attribute: ProductAttribute;
  onEdit: (attribute: ProductAttribute) => void;
}

export function ProductAttributeRowActions({
  attribute,
  onEdit,
}: ProductAttributeRowActionsProps) {
  const { confirm } = useConfirmDialog();
  const deleteAttribute = useDeleteProductAttribute();
  const [menuOpen, setMenuOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!menuOpen) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [menuOpen]);

  const handleDelete = async () => {
    setMenuOpen(false);

    const ok = await confirm({
      title: 'Delete product attribute?',
      description: `"${attribute.name}" will be marked as deleted and hidden from active lists.`,
      confirmLabel: 'Delete',
      variant: 'destructive',
    });

    if (!ok) {
      return;
    }

    try {
      await deleteAttribute.mutateAsync(attribute.id);
      toast.success('Product attribute deleted successfully.');
    } catch (error) {
      if (error instanceof AppError) {
        toast.error(error.message);
        return;
      }

      toast.error('Failed to delete product attribute. Please try again.');
    }
  };

  return (
    <div className="relative flex justify-end">
      <Button
        ref={buttonRef}
        variant="ghost"
        size="icon-sm"
        onClick={() => setMenuOpen((open) => !open)}
        aria-label="Attribute actions"
      >
        <MoreHorizontal className="h-4 w-4" />
      </Button>

      <DropdownMenu open={menuOpen} anchorRef={buttonRef} onClose={() => setMenuOpen(false)} width={168}>
        <button
          type="button"
          className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
          onClick={() => {
            setMenuOpen(false);
            onEdit(attribute);
          }}
        >
          <Pencil className="h-4 w-4 text-gray-400" />
          View / Edit
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
