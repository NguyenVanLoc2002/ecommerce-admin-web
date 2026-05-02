import { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import { Button } from './Button';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  closeOnBackdropClick?: boolean;
}

const sizeClasses: Record<NonNullable<ModalProps['size']>, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
  full: 'max-w-5xl',
};

const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

export function Modal({
  open,
  onClose,
  title,
  description,
  size = 'md',
  children,
  footer,
  className,
  closeOnBackdropClick = true,
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const uid = useId();
  const titleId = `${uid}-title`;
  const descId = `${uid}-desc`;

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

  useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    if (!panel) return;
    const trap = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      const els = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (els.length === 0) return;
      const first = els[0];
      const last = els[els.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', trap);
    return () => document.removeEventListener('keydown', trap);
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 animate-fade-in motion-reduce:animate-none"
        aria-hidden
        onClick={closeOnBackdropClick ? onClose : undefined}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal
        aria-labelledby={title ? titleId : undefined}
        aria-describedby={description ? descId : undefined}
        tabIndex={-1}
        className={cn(
          'relative z-10 w-full rounded-lg bg-white shadow-xl focus-visible:outline-none animate-scale-in motion-reduce:animate-none',
          sizeClasses[size],
          className,
        )}
      >
        {title && (
          <div className="flex items-start justify-between border-b px-6 py-4">
            <div>
              <h2 id={titleId} className="text-base font-semibold text-gray-900">
                {title}
              </h2>
              {description && (
                <p id={descId} className="mt-1 text-sm text-gray-500">
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
        <div className="px-6 py-4">{children}</div>
        {footer && <div className="flex justify-end gap-3 border-t px-6 py-4">{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}
