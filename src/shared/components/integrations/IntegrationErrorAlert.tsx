import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';

interface IntegrationErrorAlertProps {
  title: string;
  message: string;
  onRetry?: () => void;
}

export function IntegrationErrorAlert({
  title,
  message,
  onRetry,
}: IntegrationErrorAlertProps) {
  return (
    <div className="rounded-xl border border-danger-200 bg-danger-50 px-4 py-4 text-danger-900">
      <div className="flex items-start gap-3">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium">{title}</p>
          <p className="mt-1 text-sm text-danger-800">{message}</p>
          {onRetry && (
            <div className="mt-3">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={onRetry}
                leftIcon={<RefreshCw className="h-4 w-4" />}
              >
                Retry
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

