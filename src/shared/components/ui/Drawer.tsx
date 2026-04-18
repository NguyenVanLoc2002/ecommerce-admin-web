import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import { Button } from './Button';

type DrawerSide = 'right' | 'left';

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  side?: DrawerSide;
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

const sideClasses: Record<DrawerSide, string> = {
  right: 'right-0 top-0 h-full translate-x-full data-[open=true]:translate-x-0',
  left: 'left-0 top-0 h-full -translate-x-full data-[open=true]:translate-x-0',
};

const drawerWidths: Record<NonNullable<DrawerProps['size']>, string> = {
  sm: 'w-80',
  md: 'w-96',
  lg: 'w-[560px]',
};

export function Drawer({
  open,
  onClose,
  title,
  description,
  side = 'right',
  size = 'md',
  children,
  footer,
  className,
}: DrawerProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  useEffect(() => {
    if (open) panelRef.current?.focus();
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50" aria-hidden onClick={onClose} />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal
        aria-labelledby={title ? 'drawer-title' : undefined}
        aria-describedby={description ? 'drawer-desc' : undefined}
        tabIndex={-1}
        data-open={open}
        className={cn(
          'absolute z-10 flex flex-col bg-white shadow-xl focus:outline-none transition-transform duration-300',
          sideClasses[side],
          drawerWidths[size],
          className,
        )}
      >
        {title && (
          <div className="flex items-start justify-between border-b px-6 py-4 shrink-0">
            <div>
              <h2 id="drawer-title" className="text-base font-semibold text-gray-900">
                {title}
              </h2>
              {description && (
                <p id="drawer-desc" className="mt-1 text-sm text-gray-500">
                  {description}
                </p>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onClose}
              aria-label="Close"
              className="ml-4 shrink-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
        <div className="flex-1 overflow-y-auto px-6 py-4">{children}</div>
        {footer && (
          <div className="flex justify-end gap-3 border-t px-6 py-4 shrink-0">{footer}</div>
        )}
      </div>
    </div>,
    document.body,
  );
}
