import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, MoreHorizontal, Pencil, Layers, Trash2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { DropdownMenu } from '@/shared/components/ui/DropdownMenu';
import { useConfirmDialog } from '@/shared/hooks/useConfirmDialog';
import { toast } from '@/shared/stores/uiStore';
import { AppError } from '@/shared/types/api.types';
import { routes } from '@/constants/routes';
import { useDeleteProduct } from '../hooks/useDeleteProduct';
import type { ProductListItem } from '../types/product.types';

interface ProductRowActionsProps {
  product: ProductListItem;
}

export function ProductRowActions({ product }: ProductRowActionsProps) {
  const navigate = useNavigate();
  const { confirm } = useConfirmDialog();
  const deleteProduct = useDeleteProduct();
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
      title: 'Remove product?',
      description: `"${product.name}" will be removed. This action cannot be undone.`,
      confirmLabel: 'Remove',
      variant: 'destructive',
    });
    if (!ok) return;

    try {
      await deleteProduct.mutateAsync(product.id);
      toast.success('Product removed.');
    } catch (err) {
      if (err instanceof AppError) {
        toast.error(err.message);
      } else {
        toast.error('Failed to remove product. Please try again.');
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

      <DropdownMenu open={menuOpen} anchorRef={buttonRef} onClose={() => setMenuOpen(false)}>
        <button
          type="button"
          className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
          onClick={() => {
            setMenuOpen(false);
            navigate(routes.products.edit(product.id));
          }}
        >
          <Eye className="h-4 w-4 text-gray-400" />
          Detail
        </button>
        <button
          type="button"
          className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
          onClick={() => {
            setMenuOpen(false);
            navigate(routes.products.edit(product.id));
          }}
        >
          <Pencil className="h-4 w-4 text-gray-400" />
          Edit
        </button>
        <button
          type="button"
          className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
          onClick={() => {
            setMenuOpen(false);
            navigate(routes.products.variants(product.id));
          }}
        >
          <Layers className="h-4 w-4 text-gray-400" />
          Manage Variants
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
