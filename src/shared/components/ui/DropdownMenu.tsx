import { useLayoutEffect, useState, type RefObject } from 'react';
import { createPortal } from 'react-dom';

interface DropdownMenuProps {
  open: boolean;
  anchorRef: RefObject<HTMLElement>;
  onClose: () => void;
  width?: number;
  children: React.ReactNode;
}

export function DropdownMenu({
  open,
  anchorRef,
  onClose,
  width = 176,
  children,
}: DropdownMenuProps) {
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useLayoutEffect(() => {
    if (!open || !anchorRef.current) {
      return;
    }

    const updatePosition = () => {
      const rect = anchorRef.current?.getBoundingClientRect();
      if (!rect) {
        return;
      }

      const maxLeft = Math.max(8, window.innerWidth - width - 8);
      setPosition({
        top: rect.bottom + 8,
        left: Math.min(Math.max(8, rect.right - width), maxLeft),
      });
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [anchorRef, open, width]);

  if (!open) {
    return null;
  }

  return createPortal(
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div
        className="fixed z-50 rounded-md border border-gray-200 bg-white py-1 shadow-lg"
        style={{ top: position.top, left: position.left, width }}
      >
        {children}
      </div>
    </>,
    document.body,
  );
}
