import { Link, useSearchParams } from 'react-router-dom';
import { routes } from '@/constants/routes';
import { AdminLayout } from '@/shared/components/layout/AdminLayout';
import { PageHeader } from '@/shared/components/layout/PageHeader';
import { OrderReturns } from '../components/OrderReturns';
import { returnStatuses } from '../services/orderReturnService';

export function OrderReturnsPage() {
  const [params, setParams] = useSearchParams();
  const status = returnStatuses.find((value) => value === params.get('status'));
  const rawPage = Number(params.get('page') ?? 0);
  const page = Number.isInteger(rawPage) && rawPage >= 0 && rawPage <= 2147483647 ? rawPage : 0;

  return (
    <AdminLayout>
      <div className="space-y-4 p-6">
        <PageHeader title="Return requests" actions={<Link to={routes.orders.list}>Back to orders</Link>} />
        <label className="flex flex-wrap items-center gap-2">
          Return status
          <select
            className="rounded-md border border-gray-300 bg-white px-3 py-2"
            value={status ?? ''}
            onChange={(event) => setParams(event.target.value ? { status: event.target.value } : {})}
          >
            <option value="">All statuses</option>
            {returnStatuses.map((value) => <option key={value} value={value}>{value.replace(/_/g, ' ')}</option>)}
          </select>
        </label>
        <section aria-label="Return requests" className="rounded-lg border border-gray-200 bg-white p-5">
          <OrderReturns status={status} page={page} onPageChange={(next) => {
            const updated = new URLSearchParams(params);
            updated.set('page', String(next));
            setParams(updated);
          }} />
        </section>
      </div>
    </AdminLayout>
  );
}
