import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AppError } from '@/shared/types/api.types';
import { Button } from '@/shared/components/ui/Button';
import { taxService, type TaxEstimate } from './taxService';

const vnd = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' });
const percent = new Intl.NumberFormat('vi-VN', { style: 'percent', maximumFractionDigits: 6 });

async function optional<T>(read: () => Promise<T>) {
  try {
    return await read();
  } catch (error) {
    if (error instanceof AppError && error.code === 'NOT_FOUND') return null;
    throw error;
  }
}

function Breakdown({ title, snapshot }: { title: string; snapshot: TaxEstimate | null | undefined }) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium">{title}</h3>
      {snapshot ? (
        <>
          <p className="text-xs text-gray-600">Ngày xác định {snapshot.taxDate}</p>
          <dl className="grid gap-2 text-sm sm:grid-cols-3">
            <div><dt>Tổng gồm thuế</dt><dd>{vnd.format(snapshot.gross)}</dd></div>
            <div><dt>Tổng trước thuế</dt><dd>{vnd.format(snapshot.net)}</dd></div>
            <div><dt>Tiền VAT</dt><dd>{vnd.format(snapshot.vat)}</dd></div>
          </dl>
          <details>
            <summary className="cursor-pointer text-sm">Xem từng dòng</summary>
            <ul className="mt-2 divide-y divide-gray-200 text-xs">
              {snapshot.lines.map((line) => (
                <li key={line.lineKey} className="space-y-1 py-2">
                  <p className="break-all">{line.lineKey === 'shipping' ? 'Phí vận chuyển' : line.lineKey}</p>
                  <p>{line.categoryCode} · {percent.format(line.rateFraction)} · {vnd.format(line.net)} + {vnd.format(line.vat)} = {vnd.format(line.gross)}</p>
                </li>
              ))}
            </ul>
          </details>
        </>
      ) : <p className="text-sm text-gray-600">Chưa có dữ liệu.</p>}
    </div>
  );
}

export function OrderTaxSnapshots({ orderId }: { orderId: string }) {
  const [open, setOpen] = useState(false);
  const query = useQuery({
    queryKey: ['order-tax-snapshots', orderId],
    queryFn: async () => {
      const [estimate, finalized] = await Promise.all([
        optional(() => taxService.estimate(orderId)),
        optional(() => taxService.finalized(orderId)),
      ]);
      return { estimate, finalized };
    },
    enabled: open,
    retry: false,
  });

  return (
    <details onToggle={(event) => setOpen(event.currentTarget.open)}
      className="rounded-lg border border-gray-200 bg-white p-4">
      <summary className="cursor-pointer text-sm font-semibold">Thông tin VAT</summary>
      <div className="mt-3 space-y-4">
        {open && query.isPending ? <p role="status" className="text-sm">Đang tải snapshot thuế…</p> : null}
        {query.isError ? (
          <div className="space-y-2 text-sm">
            <p role="alert">Không thể xem thông tin thuế. Kiểm tra quyền truy cập hoặc thử lại.</p>
            <Button type="button" variant="secondary" onClick={() => void query.refetch()}>Tải lại</Button>
          </div>
        ) : null}
        {query.data ? (
          <>
            <Breakdown title="Ước tính khi đặt hàng" snapshot={query.data.estimate} />
            <Breakdown title="Snapshot thuế chính thức" snapshot={query.data.finalized?.amounts} />
          </>
        ) : null}
      </div>
    </details>
  );
}
