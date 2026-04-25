import { useState, useRef, useEffect, useId } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/shared/utils/cn';

type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right';

interface TooltipProps {
  content: React.ReactNode;
  placement?: TooltipPlacement;
  children: React.ReactElement;
  className?: string;
}

export function Tooltip({ content, placement = 'top', children, className }: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLSpanElement>(null);
  const uid = useId();
  const tooltipId = `tooltip-${uid}`;

  useEffect(() => {
    if (!visible || !triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const gap = 6;

    const positions: Record<TooltipPlacement, { top: number; left: number }> = {
      top: { top: rect.top + window.scrollY - gap, left: rect.left + rect.width / 2 },
      bottom: { top: rect.bottom + window.scrollY + gap, left: rect.left + rect.width / 2 },
      left: { top: rect.top + window.scrollY + rect.height / 2, left: rect.left - gap },
      right: { top: rect.top + window.scrollY + rect.height / 2, left: rect.right + gap },
    };

    setCoords(positions[placement]);
  }, [visible, placement]);

  const placementClasses: Record<TooltipPlacement, string> = {
    top: '-translate-x-1/2 -translate-y-full',
    bottom: '-translate-x-1/2',
    left: '-translate-x-full -translate-y-1/2',
    right: '-translate-y-1/2',
  };

  return (
    <>
      <span
        ref={triggerRef}
        className="inline-flex"
        aria-describedby={visible ? tooltipId : undefined}
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        onFocus={() => setVisible(true)}
        onBlur={() => setVisible(false)}
      >
        {children}
      </span>
      {visible &&
        createPortal(
          <div
            id={tooltipId}
            role="tooltip"
            style={{ top: coords.top, left: coords.left }}
            className={cn(
              'absolute z-50 max-w-xs rounded bg-gray-900 px-2 py-1 text-xs text-white shadow-sm pointer-events-none animate-fade-in motion-reduce:animate-none',
              placementClasses[placement],
              className,
            )}
          >
            {content}
          </div>,
          document.body,
        )}
    </>
  );
}
