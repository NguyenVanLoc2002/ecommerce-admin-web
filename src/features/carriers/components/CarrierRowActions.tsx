import { useEffect, useRef, useState } from 'react';
import { Eye, MoreHorizontal, Pencil, Power, Settings2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { DropdownMenu } from '@/shared/components/ui/DropdownMenu';
import { useConfirmDialog } from '@/shared/hooks/useConfirmDialog';
import { toast } from '@/shared/stores/uiStore';
import { AppError } from '@/shared/types/api.types';
import { getPhase3AdminErrorMessage } from '@/shared/utils/adminPhase3Errors';
import { useToggleCarrier } from '../hooks/useToggleCarrier';
import type { Carrier } from '../types/carrier.types';

interface CarrierRowActionsProps {
  carrier: Carrier;
  onView: (carrier: Carrier) => void;
  onEdit: (carrier: Carrier) => void;
  onConfigure: (carrier: Carrier) => void;
}

export function CarrierRowActions({
  carrier,
  onView,
  onEdit,
  onConfigure,
}: CarrierRowActionsProps) {
  const { confirm } = useConfirmDialog();
  const toggleCarrier = useToggleCarrier();
  const [menuOpen, setMenuOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!menuOpen) {
      return;
    }

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
      }
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  const handleToggle = async () => {
    setMenuOpen(false);
    const nextActive = carrier.status !== 'ACTIVE';
    const confirmed = await confirm({
      title: nextActive ? 'Enable carrier?' : 'Disable carrier?',
      description: nextActive
        ? `${carrier.name} will become available to carrier-backed shipment flows.`
        : `${carrier.name} will be removed from active carrier selection.`,
      confirmLabel: nextActive ? 'Enable' : 'Disable',
      variant: nextActive ? 'default' : 'destructive',
    });

    if (!confirmed) {
      return;
    }

    try {
      await toggleCarrier.mutateAsync({ id: carrier.id, active: nextActive });
      toast.success(nextActive ? 'Carrier enabled.' : 'Carrier disabled.');
    } catch (error) {
      if (error instanceof AppError) {
        toast.error(getPhase3AdminErrorMessage(error, 'Failed to update carrier status.'));
      } else {
        toast.error('Failed to update carrier status.');
      }
    }
  };

  return (
    <div className="relative flex justify-end">
      <Button
        ref={buttonRef}
        variant="ghost"
        size="icon-sm"
        onClick={() => setMenuOpen((open) => !open)}
        aria-label="Carrier actions"
        aria-haspopup="menu"
        aria-expanded={menuOpen}
      >
        <MoreHorizontal className="h-4 w-4" />
      </Button>

      <DropdownMenu open={menuOpen} anchorRef={buttonRef} onClose={() => setMenuOpen(false)} width={196}>
        <button
          type="button"
          className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
          onClick={() => {
            setMenuOpen(false);
            onView(carrier);
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
            onEdit(carrier);
          }}
        >
          <Pencil className="h-4 w-4 text-gray-400" />
          Edit metadata
        </button>
        <button
          type="button"
          className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
          onClick={() => {
            setMenuOpen(false);
            onConfigure(carrier);
          }}
        >
          <Settings2 className="h-4 w-4 text-gray-400" />
          Configure
        </button>
        <div className="my-1 border-t border-gray-100" />
        <button
          type="button"
          className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
          onClick={() => void handleToggle()}
        >
          <Power className="h-4 w-4 text-gray-400" />
          {carrier.status === 'ACTIVE' ? 'Disable carrier' : 'Enable carrier'}
        </button>
      </DropdownMenu>
    </div>
  );
}
