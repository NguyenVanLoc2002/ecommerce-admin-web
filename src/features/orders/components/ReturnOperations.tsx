import { useRef, useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { queryKeys } from '@/constants/queryKeys';
import { routes } from '@/constants/routes';
import { Button } from '@/shared/components/ui/Button';
import { getReturnDetail, submitReturnHandling, type OrderReturn, type ReturnHandlingRequest } from '../services/orderReturnService';

export function ReturnOperations({ entry }: { entry: OrderReturn }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="space-y-3">
      <Button variant="secondary" aria-expanded={open} onClick={() => setOpen(!open)}>
        {open ? 'Hide return operations' : 'Show return operations'}
      </Button>
      {open && <ReturnOperationDetails entry={entry} />}
    </div>
  );
}

function ReturnOperationDetails({ entry }: { entry: OrderReturn }) {
  const queryClient = useQueryClient();
  const detailKey = queryKeys.orders.returnDetail(entry.id);
  const detail = useQuery({ queryKey: detailKey, queryFn: () => getReturnDetail(entry) });
  const [validation, setValidation] = useState('');
  const attempt = useRef<{ fingerprint: string; key: string }>();
  const mutation = useMutation({
    mutationFn: ({ action, body, key }: {
      action: 'receive' | 'inspect' | 'refund'; body?: ReturnHandlingRequest; key: string;
    }) => submitReturnHandling(entry, action, body, key),
    onSettled: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: detailKey }),
        queryClient.invalidateQueries({ queryKey: queryKeys.orders.returnLists() }),
        queryClient.invalidateQueries({ queryKey: queryKeys.payments.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.inventory.all }),
      ]);
    },
  });

  if (detail.isPending) return <p role="status">Loading return operations…</p>;
  if (detail.isError) return <Button onClick={() => void detail.refetch()}>Retry loading return operations</Button>;

  const { request, receipt, inspection, refund } = detail.data;
  const isInspection = request.status === 'RECEIVED' && receipt !== null;
  const canReceive = request.status === 'APPROVED';
  const lines = isInspection ? receipt.items : request.items;

  function submit(action: 'receive' | 'inspect' | 'refund', body?: ReturnHandlingRequest) {
    if (mutation.isPending) return;
    const fingerprint = JSON.stringify([action, body]);
    if (attempt.current?.fingerprint !== fingerprint) {
      attempt.current = { fingerprint, key: crypto.randomUUID() };
    }
    mutation.mutate({ action, body, key: attempt.current.key });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const items = lines.map((line) => {
      const value = Number(form.get(line.orderItemId));
      return {
        orderItemId: line.orderItemId,
        quantity: isInspection ? line.quantity : value,
        restock: isInspection ? value : 0,
        damaged: isInspection ? line.quantity - value : 0,
      };
    }).filter((line) => line.quantity > 0);
    const hasRestock = items.some((line) => line.restock > 0);
    const warehouseId = String(form.get('warehouseId') ?? '').trim();
    const note = String(form.get('note') ?? '').trim();
    if (!items.length || !note || (hasRestock && !warehouseId)) {
      setValidation('Enter a reason and quantities. A warehouse is required for restock.');
      return;
    }
    setValidation('');
    const carrier = String(form.get('carrier') ?? '').trim();
    const trackingNumber = String(form.get('trackingNumber') ?? '').trim();
    submit(isInspection ? 'inspect' : 'receive', {
      note, items, warehouseId: hasRestock ? warehouseId : undefined,
      carrier: carrier || undefined, trackingNumber: trackingNumber || undefined,
    });
  }

  return (
    <div className="space-y-3 rounded-md border border-gray-200 p-4">
      {receipt && <p>Received {receipt.items.reduce((sum, line) => sum + line.quantity, 0)} · {receipt.note}
        {receipt.trackingNumber && <> · {receipt.carrier} {receipt.trackingNumber}</>}
      </p>}
      {inspection && <p>Inspection recorded · {inspection.note} · {inspection.items.reduce((sum, line) => sum + line.restock, 0)} restocked
        {' · '}{inspection.items.reduce((sum, line) => sum + line.damaged, 0)} damaged</p>}
      {refund && (
        <p>Refund {refund.refundCode} · {refund.status.replace(/_/g, ' ')}
          {' · '}<Link className="underline" to={routes.payments.detail(refund.paymentId)}>Payment details</Link>
        </p>
      )}
      {(canReceive || isInspection) && (
        <form key={request.status} className="space-y-2" onSubmit={handleSubmit}>
          {lines.map((line) => (
            <label key={line.orderItemId} className="block break-all">
              {isInspection ? 'Restock quantity' : 'Received quantity'} for {line.orderItemId} (max {line.quantity})
              <input className="ml-2 w-20 rounded border px-2" name={line.orderItemId}
                type="number" min={0} max={line.quantity} defaultValue={isInspection ? 0 : line.quantity} required />
            </label>
          ))}
          {canReceive && (
            <>
              <label className="block">Return carrier <input className="rounded border px-2" name="carrier" maxLength={100} /></label>
              <label className="block">Return tracking number <input className="rounded border px-2" name="trackingNumber" maxLength={200} /></label>
            </>
          )}
          {isInspection && <label className="block">Restock warehouse ID <input className="rounded border px-2" name="warehouseId" /></label>}
          <label className="block">Reason <textarea className="block w-full rounded border p-2" name="note" maxLength={1000} required /></label>
          <Button type="submit" isLoading={mutation.isPending}>{isInspection ? 'Record inspection' : 'Record receipt'}</Button>
        </form>
      )}
      {request.status === 'INSPECTED' && !refund && (
        <Button isLoading={mutation.isPending} onClick={() => submit('refund')}>Prepare pending refund</Button>
      )}
      {mutation.isPending && <p role="status">Saving return operation…</p>}
      {mutation.isSuccess && <p role="status">Return operation saved.</p>}
      {validation && <p role="alert">{validation}</p>}
      {mutation.isError && <p role="alert">{mutation.error.message}</p>}
    </div>
  );
}
