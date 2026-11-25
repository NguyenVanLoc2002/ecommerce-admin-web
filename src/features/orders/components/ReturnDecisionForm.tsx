import { useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/shared/components/ui/Button';
import { useReturnDecision } from '../hooks/useReturnDecision';
import type { OrderReturn, ReturnDecision } from '../services/orderReturnService';

const schema = z.object({
  reason: z.string().trim().min(1, 'Enter a reason.').max(1000),
  deliveredAt: z.string().optional(),
});

export function ReturnDecisionForm({ entry }: { entry: OrderReturn }) {
  const { register, handleSubmit, setError, clearErrors, formState: { errors, isSubmitting } } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { reason: '' },
  });
  const mutation = useReturnDecision(entry);
  const request = useRef<{ action: ReturnDecision; reason: string; key: string; deliveredAt?: string }>();
  const reasonId = `return-reason-${entry.id}`;

  async function submit(action: ReturnDecision, reason: string, localDeliveryTime?: string) {
    if (mutation.isPending) return;
    clearErrors('deliveredAt');
    let deliveredAt: string | undefined;
    if (action === 'verify-delivery') {
      const delivery = new Date(localDeliveryTime ?? '');
      if (Number.isNaN(delivery.getTime()) || delivery.getTime() > Date.now()) {
        setError('deliveredAt', { message: 'Enter a valid delivery date and time in the past.' }, { shouldFocus: true });
        return;
      }
      deliveredAt = delivery.toISOString().slice(0, -1);
    }
    if (request.current?.action !== action || request.current.reason !== reason || request.current.deliveredAt !== deliveredAt) {
      request.current = { action, reason, key: crypto.randomUUID(), deliveredAt };
    }
    await mutation.mutateAsync(request.current).catch(() => undefined);
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium" htmlFor={reasonId}>Decision reason</label>
      <textarea
        id={reasonId}
        className="w-full rounded-md border border-gray-300 p-2"
        maxLength={1000}
        disabled={isSubmitting || mutation.isPending}
        aria-invalid={Boolean(errors.reason)}
        aria-describedby={errors.reason ? `${reasonId}-error` : undefined}
        {...register('reason')}
      />
      {errors.reason && <p id={`${reasonId}-error`} role="alert">{errors.reason.message}</p>}
      {entry.status === 'PENDING_DELIVERY_VERIFICATION' && (
        <div>
          <label className="block text-sm font-medium" htmlFor={`${reasonId}-date`}>Delivered at (local time)</label>
          <input id={`${reasonId}-date`} type="datetime-local" className="rounded border p-2"
            disabled={isSubmitting || mutation.isPending} aria-invalid={Boolean(errors.deliveredAt)}
            aria-describedby={errors.deliveredAt ? `${reasonId}-date-error` : undefined} {...register('deliveredAt')} />
          {errors.deliveredAt && <p id={`${reasonId}-date-error`} role="alert">{errors.deliveredAt.message}</p>}
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        {entry.status === 'PENDING_DELIVERY_VERIFICATION' && (
          <Button disabled={isSubmitting || mutation.isPending} onClick={() => {
            void handleSubmit(({ reason, deliveredAt }) => submit('verify-delivery', reason, deliveredAt))();
          }}>Verify delivery</Button>
        )}
        {entry.status === 'REQUESTED' && (
          <Button disabled={isSubmitting || mutation.isPending} onClick={() => {
            void handleSubmit(({ reason }) => submit('approve', reason))();
          }}>Approve return</Button>
        )}
        <Button variant="secondary" disabled={isSubmitting || mutation.isPending} onClick={() => {
          void handleSubmit(({ reason }) => submit('reject', reason))();
        }}>Reject return</Button>
      </div>
      {mutation.isPending && <p role="status">Saving decision…</p>}
      {mutation.isError && <p role="alert">{mutation.error.message}</p>}
    </div>
  );
}
