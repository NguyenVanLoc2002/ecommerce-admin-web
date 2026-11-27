import { useState, type FormEvent } from 'react';
import { CatalogTargetPicker } from '@/shared/components/catalog/CatalogTargetPicker';
import { Button } from '@/shared/components/ui/Button';
import { useProductBadgeAssignments } from '../hooks/useProductBadges';
import type { ProductBadge } from '../services/productBadgeService';

export function ProductBadgeAssignments({ badge }: { badge: ProductBadge }) {
  const [page, setPage] = useState(0);
  const [product, setProduct] = useState('');
  const { assign, products, unassign } = useProductBadgeAssignments(badge.id, page);
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (product && badge.active) assign.mutate(product, { onSuccess: () => { setProduct(''); setPage(0); } });
  };

  return (
    <section className="space-y-4 rounded-lg border border-gray-200 bg-white p-4 md:p-6">
      <h2 className="font-semibold">Sản phẩm đã gán</h2>
      {products.isPending ? <p role="status">Đang tải…</p> : null}
      {products.isError ? <Button onClick={() => void products.refetch()} variant="secondary">Tải lại sản phẩm</Button> : null}
      {products.data?.items.length === 0 ? <p className="text-sm text-gray-600">Trang này chưa có sản phẩm.</p> : null}
      <ul className="divide-y divide-gray-200">
        {products.data?.items.map((item) => (
          <li className="flex items-center justify-between gap-3 py-2" key={item.id}>
            <span className="min-w-0 break-words">{item.name}</span>
            <Button disabled={unassign.isPending} onClick={() => unassign.mutate(item.id)} size="sm" variant="secondary">Bỏ gán</Button>
          </li>
        ))}
      </ul>
      <div className="flex gap-2">
        <Button disabled={page === 0} onClick={() => setPage((current) => current - 1)} size="sm" variant="secondary">Trang trước</Button>
        <Button disabled={!products.data?.hasNext} onClick={() => setPage((current) => current + 1)} size="sm" variant="secondary">Trang sau</Button>
      </div>
      {badge.active ? (
        <form className="space-y-3 border-t border-gray-200 pt-3" onSubmit={submit}>
          <CatalogTargetPicker kind="products" label="Sản phẩm" onChange={setProduct} value={product} />
          <Button type="submit" disabled={!product || assign.isPending}>Gán nhãn</Button>
        </form>
      ) : null}
      {assign.isError || unassign.isError ? <p role="alert" className="text-sm text-danger-700">{(assign.error ?? unassign.error)?.message || 'Không thể cập nhật nhãn.'}</p> : null}
      {assign.isSuccess ? <p role="status" className="text-sm">Đã gán nhãn.</p> : null}
    </section>
  );
}
