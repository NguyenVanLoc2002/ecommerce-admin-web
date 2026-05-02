import { useEffect, useRef, useState } from 'react';
import { Eye, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { DropdownMenu } from '@/shared/components/ui/DropdownMenu';
import { useConfirmDialog } from '@/shared/hooks/useConfirmDialog';
import { useAuthStore } from '@/shared/stores/authStore';
import { toast } from '@/shared/stores/uiStore';
import { AppError } from '@/shared/types/api.types';
import { useDeleteUser } from '../hooks/useDeleteUser';
import type { AdminUser } from '../types/user.types';

interface UserRowActionsProps {
  user: AdminUser;
  onView: (user: AdminUser) => void;
  onEdit: (user: AdminUser) => void;
}

export function UserRowActions({ user, onView, onEdit }: UserRowActionsProps) {
  const { confirm } = useConfirmDialog();
  const currentUser = useAuthStore((state) => state.user);
  const deleteUser = useDeleteUser();
  const [menuOpen, setMenuOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!menuOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [menuOpen]);

  const isCurrentUser = String(currentUser?.id ?? '') === user.id;

  const handleDelete = async () => {
    setMenuOpen(false);

    const ok = await confirm({
      title: 'Deactivate staff account?',
      description:
        'This action may deactivate or soft-delete the staff account depending on backend rules.',
      confirmLabel: 'Deactivate staff',
      variant: 'destructive',
    });

    if (!ok) {
      return;
    }

    try {
      await deleteUser.mutateAsync(user.id);
      toast.success('Staff account deactivated.');
    } catch (error) {
      if (error instanceof AppError) {
        switch (error.code) {
          case 'USER_NOT_FOUND':
            toast.error('Staff account not found.');
            break;
          case 'FORBIDDEN':
            toast.error(error.message || 'You cannot deactivate this staff account.');
            break;
          default:
            toast.error(error.message || 'Failed to deactivate staff account.');
        }
      } else {
        toast.error('Failed to deactivate staff account.');
      }
    }
  };

  return (
    <div className="relative flex justify-end" onClick={(event) => event.stopPropagation()}>
      <Button
        ref={buttonRef}
        variant="ghost"
        size="icon-sm"
        onClick={() => setMenuOpen((value) => !value)}
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
            onView(user);
          }}
        >
          <Eye className="h-4 w-4 text-gray-400" />
          View details
        </button>
        <button
          type="button"
          className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
          onClick={() => {
            setMenuOpen(false);
            onEdit(user);
          }}
        >
          <Pencil className="h-4 w-4 text-gray-400" />
          Edit
        </button>
        <div className="my-1 border-t border-gray-100" />
        <button
          type="button"
          className="flex w-full items-center gap-2 px-3 py-2 text-sm text-danger-600 hover:bg-danger-50 disabled:cursor-not-allowed disabled:opacity-50"
          onClick={() => void handleDelete()}
          disabled={isCurrentUser || deleteUser.isPending}
          title={isCurrentUser ? 'You cannot deactivate your own account.' : 'Deactivate staff'}
        >
          <Trash2 className="h-4 w-4" />
          Deactivate
        </button>
      </DropdownMenu>
    </div>
  );
}
