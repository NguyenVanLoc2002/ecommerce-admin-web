import { Link } from 'react-router-dom';
import { routes } from '@/constants/routes';
import { ErrorCard } from '@/shared/components/feedback/ErrorCard';
import { Button } from '@/shared/components/ui/Button';
import { ReturnDecisionForm } from './ReturnDecisionForm';
import { useOrderReturns } from '../hooks/useOrderReturns';

interface OrderReturnsProps {
  orderId?: string;
  status?: Parameters<typeof useOrderReturns>[0]['status'];
  page: number;
  onPageChange: (page: number) => void;
}

export function OrderReturns({ orderId, status, page, onPageChange }: OrderReturnsProps) {
  const { data, isPending, isError, refetch } = useOrderReturns({ orderId, status, page });
  if (isPending) return <p role="status">Loading return requests…</p>;
  if (isError) return <ErrorCard onRetry={() => void refetch()} />;
  if (!data.items.length && page === 0) return <p>No return requests found.</p>;

  return (
    <>
      <ul className="divide-y divide-gray-200">
        {data.items.map((entry) => (
          <li key={entry.id} className="space-y-2 py-4">
            <h3 className="font-medium">{entry.status.replace(/_/g, ' ')}</h3>
            {!orderId && (
              <Link className="text-primary-700 underline" to={routes.orders.detail(entry.orderId)}>
                Order {entry.orderId}
              </Link>
            )}
            <p>{entry.reason.replace(/_/g, ' ')} · {entry.createdAt.slice(0, 10)}</p>
            {entry.note && <p className="break-words">{entry.note}</p>}
            <ul className="space-y-1 text-sm text-gray-700">
              {entry.items.map((item) => (
                <li key={item.orderItemId}>Item {item.orderItemId} · Requested quantity {item.quantity}</li>
              ))}
            </ul>
            {orderId && (entry.status === 'REQUESTED' || entry.status === 'PENDING_DELIVERY_VERIFICATION') && (
              <ReturnDecisionForm entry={entry} />
            )}
          </li>
        ))}
      </ul>
      {(data.hasPrevious || data.hasNext) && (
        <nav aria-label="Return request pages" className="flex items-center gap-2">
          <Button variant="secondary" disabled={!data.hasPrevious} onClick={() => onPageChange(page - 1)}>
            Previous
          </Button>
          <span>Page {page + 1}</span>
          <Button variant="secondary" disabled={!data.hasNext} onClick={() => onPageChange(page + 1)}>
            Next
          </Button>
        </nav>
      )}
    </>
  );
}
