import { useRef, useState, type FormEvent } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useConfirmDialog } from '@/shared/hooks/useConfirmDialog';
import { Button } from '@/shared/components/ui/Button';
import { queryKeys } from '@/constants/queryKeys';
import { routes } from '@/constants/routes';
import {
  submitReturnExchange, type ExchangeSelection, type ReturnDetail,
} from '../services/orderReturnService';

const uuidPattern = '[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}';

export function ReturnExchangePanel({ detail }: { detail: ReturnDetail }) {
  const { request, inspection, refund } = detail;
  const exchanges = detail.exchanges ?? [];
  const { confirm } = useConfirmDialog();
  const queryClient = useQueryClient();
  const [selectedItem, setSelectedItem] = useState('');
  const attempt = useRef<{ fingerprint: string; key: string }>();
  const mutation = useMutation({
    mutationFn: (operation: Parameters<typeof submitReturnExchange>[1]) => submitReturnExchange(request, operation),
    onSuccess: () => { attempt.current = undefined; },
    onSettled: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.orders.returnDetail(request.id) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.orders.returnLists() }),
        queryClient.invalidateQueries({ queryKey: queryKeys.orders.lists() }),
        queryClient.invalidateQueries({ queryKey: queryKeys.inventory.all }),
      ]);
    },
  });

  const canReserve = !refund && request.reason !== 'MISSING_ITEM'
    && (request.status === 'APPROVED' || request.status === 'INSPECTED');
  const lines = request.status === 'INSPECTED'
    ? (inspection?.items ?? []).map((line) => ({
      ...line, quantity: request.reason === 'CHANGED_MIND' ? line.restock : line.quantity,
    }))
    : request.items;
  const available = lines.map((line) => ({
    orderItemId: line.orderItemId,
    quantity: line.quantity - exchanges.filter((exchange) =>
      exchange.orderItemId === line.orderItemId &&
      (exchange.status === 'RESERVED' || exchange.status === 'REPLACEMENT_CREATED'))
      .reduce((total, exchange) => total + exchange.quantity, 0),
  })).filter((line) => line.quantity > 0);
  const selected = available.find((line) => line.orderItemId === selectedItem) ?? available[0];

  function reserve(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected || mutation.isPending) return;
    const form = new FormData(event.currentTarget);
    const quantity = Number(form.get('quantity'));
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > selected.quantity) return;
    const evidence = String(form.get('priceEvidence') ?? '').trim();
    const selection: ExchangeSelection = {
      orderItemId: selected.orderItemId,
      variantId: String(form.get('variantId')),
      warehouseId: String(form.get('warehouseId')),
      quantity,
      historicalPriceEvidence: evidence || undefined,
    };
    const fingerprint = JSON.stringify(selection);
    if (attempt.current?.fingerprint !== fingerprint) {
      attempt.current = { fingerprint, key: crypto.randomUUID() };
    }
    mutation.mutate({ action: 'reserve', selection, key: attempt.current.key });
  }

  async function cancel(exchangeId: string) {
    if (mutation.isPending) return;
    const accepted = await confirm({
      title: 'Cancel exchange?',
      description: 'Any stock held for this exchange will be released.',
      confirmLabel: 'Cancel exchange',
      variant: 'destructive',
    });
    if (accepted) mutation.mutate({ action: 'cancel', exchangeId });
  }

  if (!canReserve && !exchanges.length) return null;

  return (
    <section className="space-y-3 border-t border-gray-200 pt-3" aria-label="Exchange">
      <h4 className="font-medium">Exchange</h4>
      <ul className="space-y-3">
        {exchanges.map((exchange) => (
          <li key={exchange.id} className="space-y-2 rounded border border-gray-200 p-3">
            <p>{exchange.status.replace(/_/g, ' ')} · Quantity {exchange.quantity}</p>
            <p className="break-all text-sm">Variant {exchange.variantId}</p>
            {exchange.status === 'RESERVED' && exchange.expiresAt && (
              <p className="text-sm">Hold expires {exchange.expiresAt.replace('T', ' ').replace(/Z$/, '')} UTC</p>
            )}
            {exchange.replacementOrderId && (
              <Link className="text-primary-700 underline" to={routes.orders.detail(exchange.replacementOrderId)}>
                Open replacement order
              </Link>
            )}
            <div className="flex flex-wrap gap-2">
              {request.status === 'INSPECTED' && exchange.status === 'RESERVED' && (
                <Button disabled={mutation.isPending} onClick={() =>
                  mutation.mutate({ action: 'replacement', exchangeId: exchange.id })}>Create replacement</Button>
              )}
              {exchange.status !== 'CANCELLED' && exchange.status !== 'REPLACEMENT_CREATED' && (
                <Button variant="secondary" disabled={mutation.isPending} onClick={() => void cancel(exchange.id)}>
                  Cancel exchange
                </Button>
              )}
            </div>
          </li>
        ))}
      </ul>
      {canReserve && selected && (
        <form className="space-y-3" onSubmit={reserve}>
          <fieldset className="space-y-2" disabled={mutation.isPending}>
            <label className="block">Returned item
              <select className="ml-2 rounded border p-1" value={selected.orderItemId} onChange={(event) => setSelectedItem(event.target.value)}>
                {available.map((line) => <option key={line.orderItemId} value={line.orderItemId}>{line.orderItemId}</option>)}
              </select>
            </label>
            <label className="block">Replacement variant ID
              <input className="ml-2 rounded border p-1" name="variantId" pattern={uuidPattern} required />
            </label>
            <label className="block">Warehouse ID
              <input className="ml-2 rounded border p-1" name="warehouseId" pattern={uuidPattern} required />
            </label>
            <label className="block">Quantity (max {selected.quantity})
              <input key={selected.orderItemId} className="ml-2 w-20 rounded border p-1"
                name="quantity" type="number" min={1} max={selected.quantity} defaultValue={1} required />
            </label>
            <label className="block">Historical price evidence (optional)
              <input className="ml-2 rounded border p-1" name="priceEvidence" maxLength={500} />
            </label>
            <Button type="submit">Request exchange reservation</Button>
          </fieldset>
        </form>
      )}
      {mutation.isPending && <p role="status">Saving exchange operation…</p>}
      {mutation.isSuccess && <p role="status">Exchange status: {mutation.data.status.replace(/_/g, ' ')}</p>}
      {mutation.isError && <p role="alert">{mutation.error.message}</p>}
    </section>
  );
}
