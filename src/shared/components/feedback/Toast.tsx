import { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info, RefreshCw } from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import { useUiStore } from '@/shared/stores/uiStore';
import type { Toast as ToastType, ToastVariant } from '@/shared/types/api.types';

const variantConfig: Record<
  ToastVariant,
  { icon: React.ElementType; containerClass: string; iconClass: string }
> = {
  success: {
    icon: CheckCircle,
    containerClass: 'bg-success-50 border-success-200',
    iconClass: 'text-success-600',
  },
  error: {
    icon: AlertCircle,
    containerClass: 'bg-danger-50 border-danger-200',
    iconClass: 'text-danger-600',
  },
  warning: {
    icon: AlertTriangle,
    containerClass: 'bg-warning-50 border-warning-200',
    iconClass: 'text-warning-600',
  },
  info: {
    icon: Info,
    containerClass: 'bg-info-50 border-info-200',
    iconClass: 'text-info-600',
  },
};

const AUTO_DISMISS_MS: Record<ToastVariant, number | null> = {
  success: 4000,
  error: null,
  warning: 6000,
  info: 4000,
};

function ToastItem({ toast }: { toast: ToastType }) {
  const removeToast = useUiStore((s) => s.removeToast);
  const { icon: Icon, containerClass, iconClass } = variantConfig[toast.variant];
  const autoDismiss = toast.duration ?? AUTO_DISMISS_MS[toast.variant];

  useEffect(() => {
    if (autoDismiss === null) return;
    const timer = setTimeout(() => removeToast(toast.id), autoDismiss);
    return () => clearTimeout(timer);
  }, [toast.id, autoDismiss, removeToast]);

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={cn(
        'flex items-start gap-3 w-80 rounded-lg border p-4 shadow-md',
        containerClass,
      )}
    >
      <Icon className={cn('h-5 w-5 shrink-0 mt-0.5', iconClass)} aria-hidden />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 break-words">{toast.message}</p>
        {toast.onRetry && (
          <button
            type="button"
            onClick={toast.onRetry}
            className="mt-1 flex items-center gap-1 text-xs text-gray-600 hover:text-gray-900 underline"
          >
            <RefreshCw className="h-3 w-3" />
            Retry
          </button>
        )}
      </div>
      <button
        type="button"
        onClick={() => removeToast(toast.id)}
        aria-label="Dismiss"
        className="shrink-0 text-gray-400 hover:text-gray-600"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export function ToastContainer() {
  const toasts = useUiStore((s) => s.toasts);
  const visible = toasts.slice(0, 3);

  return (
    <div
      aria-label="Notifications"
      className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2"
    >
      {visible.map((t) => (
        <ToastItem key={t.id} toast={t} />
      ))}
    </div>
  );
}
