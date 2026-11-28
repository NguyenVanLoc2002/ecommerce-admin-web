import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { AdminLayout } from '@/shared/components/layout/AdminLayout';
import { PageHeader } from '@/shared/components/layout/PageHeader';
import { Button } from '@/shared/components/ui/Button';
import { toast } from '@/shared/stores/uiStore';
import { AppError } from '@/shared/types/api.types';
import { freeShippingService, type FreeShippingPolicy } from './freeShippingService';

const queryKey = ['shipping', 'free-shipping'];

function FreeShippingForm({ policy }: { policy: FreeShippingPolicy }) {
  const [enabled, setEnabled] = useState(policy.enabled);
  const [threshold, setThreshold] = useState(policy.threshold == null ? '' : String(policy.threshold));
  const queryClient = useQueryClient();
  const save = useMutation({
    mutationFn: freeShippingService.update,
    onSuccess: (current) => {
      queryClient.setQueryData(queryKey, current);
      toast.success('Đã lưu chính sách miễn phí vận chuyển.');
    },
  });
  const amount = threshold === '' ? null : Number(threshold);
  const valid = amount === null ? !enabled : /^[0-9]+$/.test(threshold) && Number.isSafeInteger(amount) && amount > 0;
  const changed = enabled !== policy.enabled || amount !== policy.threshold;

  return (
    <form className="max-w-xl space-y-5 rounded-lg border bg-white p-5" onSubmit={(event) => {
      event.preventDefault();
      if (valid && changed && !save.isPending) save.mutate({ enabled, threshold: amount, revision: policy.revision });
    }}>
      <label className="flex items-center gap-3 text-sm font-medium">
        <input type="checkbox" checked={enabled} disabled={save.isPending} onChange={(event) => setEnabled(event.target.checked)} />
        Áp dụng miễn phí vận chuyển toàn shop
      </label>
      <label className="block space-y-1 text-sm font-medium" htmlFor="shipping-threshold">
        Ngưỡng tiền hàng (VND)
        <input id="shipping-threshold" className="block w-full rounded-md border border-gray-300 px-3 py-2"
          aria-describedby="shipping-threshold-help" inputMode="numeric" required={enabled}
          value={threshold} disabled={save.isPending} onChange={(event) => setThreshold(event.target.value)} />
      </label>
      <p id="shipping-threshold-help" className="text-sm text-gray-600">Tính trên tiền hàng sau giảm giá, chưa gồm phí giao hàng.</p>
      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" isLoading={save.isPending} disabled={!valid || !changed || save.isPending}>Lưu chính sách</Button>
        {save.isError ? (
          <p className="text-sm text-danger-600" role="alert">
            {save.error instanceof AppError ? save.error.message : 'Không lưu được chính sách.'}
          </p>
        ) : null}
        {save.isError && save.error instanceof AppError && save.error.code === 'CONFLICT' ? (
          <Button variant="secondary" type="button" onClick={() => void queryClient.invalidateQueries({ queryKey })}>Tải cấu hình mới</Button>
        ) : null}
      </div>
    </form>
  );
}

export function FreeShippingPage() {
  const policy = useQuery({ queryKey, queryFn: freeShippingService.get });

  return (
    <AdminLayout>
      <PageHeader title="Miễn phí vận chuyển" description="Quản lý ngưỡng áp dụng trên toàn shop." />
      <section className="mt-5 space-y-3">
        {policy.isPending ? <p role="status">Đang tải cấu hình…</p> : null}
        {policy.isError ? (
          <div role="alert">
            <p className="mb-2 text-sm text-danger-600">Không tải được chính sách miễn phí vận chuyển.</p>
            <Button variant="secondary" type="button" onClick={() => void policy.refetch()}>Thử lại</Button>
          </div>
        ) : null}
        {policy.data ? <FreeShippingForm key={policy.data.revision} policy={policy.data} /> : null}
      </section>
    </AdminLayout>
  );
}
