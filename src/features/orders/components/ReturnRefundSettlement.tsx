import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { type FormEvent } from 'react';
import { queryKeys } from '@/constants/queryKeys';
import { routes } from '@/constants/routes';
import { Button } from '@/shared/components/ui/Button';
import { useConfirmDialog } from '@/shared/hooks/useConfirmDialog';
import { useAuthStore } from '@/shared/stores/authStore';
import { formatMoney } from '@/shared/utils/formatMoney';
import { settleReturnRefund, type OrderReturn, type ReturnDetail, type ReturnRefund, type RefundSettlement } from '../services/orderReturnService';

export function ReturnRefundSettlement({ entry, refund }: { entry: OrderReturn; refund: ReturnRefund }) {
  const queryClient = useQueryClient();
  const { confirm } = useConfirmDialog();
  const email = useAuthStore((state) => state.user?.email);
  const mutation = useMutation({
    mutationFn: (operation: RefundSettlement) => settleReturnRefund(entry, operation),
    onSuccess: (result) => {
      queryClient.setQueryData(queryKeys.orders.returnDetail(entry.id),
        (previous: ReturnDetail | undefined) =>
          previous ? { ...previous, refund: result } : previous);
    },
    onSettled: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.orders.returnDetail(entry.id) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.orders.detail(entry.orderId) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.orders.lists() }),
        queryClient.invalidateQueries({ queryKey: queryKeys.payments.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.invoices.all }),
      ]);
    },
  });

  const isCod = refund.paymentMethod === 'COD';
  const isMaker = Boolean(email && refund.settlementSubmittedBy &&
    email.toLowerCase() === refund.settlementSubmittedBy.toLowerCase());
  const canSubmitEvidence = refund.status === 'PENDING' && (isCod || refund.paymentMethod === 'ONLINE');
  const canReviewCod = isCod && refund.status === 'PROCESSING' && Boolean(refund.settlementSubmittedBy);
  const pending = mutation.isPending;

  function submitEvidence(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const reference = String(new FormData(event.currentTarget).get('reference') ?? '').trim();
    if (!pending && reference) mutation.mutate({ action: isCod ? 'cod/evidence' : 'paypal/verify', reference });
  }

  async function confirmCod() {
    if (pending || isMaker || !canReviewCod) return;
    const accepted = await confirm({
      title: 'Confirm the COD refund transfer?',
      description: `Verify transfer evidence for ${formatMoney(refund.amount)} before confirming.`,
      confirmLabel: 'Confirm refund',
    });
    if (accepted) mutation.mutate({ action: 'cod/confirm' });
  }

  return (
    <section aria-label="Return refund" className="space-y-2 border-t border-gray-200 pt-3">
      <h4 className="font-medium">Return refund</h4>
      <p>{refund.refundCode} · {formatMoney(refund.amount)} · {refund.status.replace(/_/g, ' ')}</p>
      <Link className="text-primary-700 underline" to={routes.payments.detail(refund.paymentId)}>Payment details</Link>
      {canSubmitEvidence && (
        <form key={refund.status} className="space-y-2" onSubmit={submitEvidence}>
          <label className="block">
            {isCod ? 'COD transfer reference' : 'PayPal refund ID'}
            <input className="ml-2 rounded border px-2 py-1" name="reference" maxLength={isCod ? 180 : 100}
              pattern={isCod ? '.*\\S.*' : '[A-Za-z0-9\\-]+'} required disabled={pending} />
          </label>
          {!isCod && <p className="text-sm text-gray-600">Use refund code {refund.refundCode} as the invoice ID when issuing the PayPal refund.</p>}
          <Button type="submit" isLoading={pending}>{isCod ? 'Submit transfer evidence' : 'Verify PayPal refund'}</Button>
        </form>
      )}
      {canReviewCod && (
        <>
          <p>Transfer {refund.settlementReference?.replace(/^COD:/, '')} · Submitted by {refund.settlementSubmittedBy}</p>
          {isMaker
            ? <p>A different Admin must confirm the transfer.</p>
            : <Button isLoading={pending} onClick={() => void confirmCod()}>Review and confirm transfer</Button>}
        </>
      )}
      {mutation.isError && <p role="alert">{mutation.error.message}</p>}
      {mutation.isSuccess && mutation.data.status === 'PENDING' && (
        <p role="status">PayPal has no completed result for this refund yet. Check again when its status changes.</p>
      )}
      {mutation.isSuccess && mutation.data.status === 'PROCESSING' && (
        <p role="status">Evidence recorded. A different Admin must confirm the transfer.</p>
      )}
      {mutation.isSuccess && mutation.data.status === 'COMPLETED' && <p role="status">Refund confirmed.</p>}
    </section>
  );
}
