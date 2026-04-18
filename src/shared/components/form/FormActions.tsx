import { cn } from '@/shared/utils/cn';
import { Button } from '@/shared/components/ui/Button';

interface FormActionsProps {
  isSubmitting?: boolean;
  submitLabel?: string;
  cancelLabel?: string;
  onCancel?: () => void;
  className?: string;
}

export function FormActions({
  isSubmitting,
  submitLabel = 'Save',
  cancelLabel = 'Cancel',
  onCancel,
  className,
}: FormActionsProps) {
  return (
    <div className={cn('flex items-center gap-3 pt-2', className)}>
      {onCancel && (
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isSubmitting}>
          {cancelLabel}
        </Button>
      )}
      <Button type="submit" isLoading={isSubmitting}>
        {isSubmitting ? 'Saving…' : submitLabel}
      </Button>
    </div>
  );
}
