import { useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/shared/components/ui/Button';
import { useReturnDecision } from '../hooks/useReturnDecision';
import type { OrderReturn, ReturnDecision } from '../services/orderReturnService';

const schema = z.object({ reason: z.string().trim().min(1, 'Enter a reason.').max(1000) });

export function ReturnDecisionForm({ entry }: { entry: OrderReturn }) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { reason: '' },
  });
  const mutation = useReturnDecision(entry);
  const request = useRef<{ action: ReturnDecision; reason: string; key: string }>();
  const reasonId = `return-reason-${entry.id}`;

  async function submit(action: ReturnDecision, reason: string) {
    if (mutation.isPending) return;
    if (request.current?.action !== action || request.current.reason !== reason) {
      request.current = { action, reason, key: crypto.randomUUID() };
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
      <div className="flex flex-wrap gap-2">
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
