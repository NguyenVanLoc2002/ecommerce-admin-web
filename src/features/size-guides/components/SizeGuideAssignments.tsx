import { useState, type FormEvent } from 'react';
import { CatalogTargetPicker } from '@/shared/components/catalog/CatalogTargetPicker';
import { Button } from '@/shared/components/ui/Button';
import { useSizeGuideAssignments } from '../hooks/useSizeGuides';
import type { Guide, Scope } from '../services/sizeGuideService';

const scopes: Record<Scope, string> = {
  PRODUCT: 'Sản phẩm',
  CATEGORY_BRAND: 'Danh mục + thương hiệu',
  BRAND: 'Thương hiệu',
  CATEGORY: 'Danh mục',
  SHOP: 'Mặc định toàn shop',
};

export function SizeGuideAssignments({ guide }: { guide: Guide }) {
  const { assignments, assign, unassign } = useSizeGuideAssignments(guide.id);
  const [scope, setScope] = useState<Scope>('PRODUCT');
  const [product, setProduct] = useState('');
  const [category, setCategory] = useState('');
  const [brand, setBrand] = useState('');
  const [priority, setPriority] = useState(100);
  const [confirmed, setConfirmed] = useState(false);
  const needsCategory = scope === 'CATEGORY' || scope === 'CATEGORY_BRAND';
  const needsBrand = scope === 'BRAND' || scope === 'CATEGORY_BRAND';
  const hasTarget = (scope !== 'PRODUCT' || product) && (!needsCategory || category) && (!needsBrand || brand);
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!hasTarget || !confirmed) return;
    assign.mutate({
      scope, priority,
      productId: scope === 'PRODUCT' ? product : undefined,
      categoryId: needsCategory ? category : undefined,
      brandId: needsBrand ? brand : undefined,
    }, { onSuccess: () => setConfirmed(false) });
  };

  return (
    <section className="space-y-4 rounded-lg border border-gray-200 bg-white p-4 md:p-6" aria-label="Gán bảng size">
      <h2 className="font-semibold">Gán bảng size</h2>
      {assignments.isPending ? <p role="status">Đang tải…</p> : null}
      {assignments.isError ? <Button onClick={() => void assignments.refetch()} variant="secondary">Tải lại lượt gán</Button> : null}
      {assignments.data?.length === 0 ? <p className="text-sm text-gray-600">Chưa có lượt gán.</p> : null}
      <ul className="space-y-2 text-sm">
        {assignments.data?.map((assignment) => (
          <li className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-200 py-2" key={assignment.key}>
            <span className="min-w-0 break-all">{scopes[assignment.scope]} · Ưu tiên {assignment.priority}<br />{[assignment.productName ?? assignment.productId, assignment.categoryName ?? assignment.categoryId, assignment.brandName ?? assignment.brandId].filter(Boolean).join(' / ')}</span>
            <Button disabled={unassign.isPending} onClick={() => unassign.mutate(assignment.key)} size="sm" type="button" variant="secondary">Bỏ gán</Button>
          </li>
        ))}
      </ul>
      <form className="space-y-4 border-t border-gray-200 pt-4" onSubmit={submit}>
        <fieldset className="space-y-3" disabled={!guide.active || assign.isPending}>
          <label className="block text-sm font-medium">Phạm vi
            <select className="block w-full rounded-md border border-gray-300 p-2" value={scope} onChange={(event) => { setScope(event.target.value as Scope); setConfirmed(false); }}>
              {Object.entries(scopes).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
            </select>
          </label>
          {scope === 'PRODUCT' ? <CatalogTargetPicker kind="products" label="Sản phẩm" onChange={setProduct} value={product} /> : null}
          {needsCategory ? <CatalogTargetPicker kind="categories" label="Danh mục" onChange={setCategory} value={category} /> : null}
          {needsBrand ? <CatalogTargetPicker kind="brands" label="Thương hiệu" onChange={setBrand} value={brand} /> : null}
          <label className="block text-sm font-medium">Độ ưu tiên trong cùng phạm vi
            <input className="block w-32 rounded-md border border-gray-300 p-2" max={1000000} min={0} onChange={(event) => setPriority(Number(event.target.value))} required type="number" value={priority} />
          </label>
          <p className="text-sm text-gray-600">Số nhỏ hơn được ưu tiên. Nếu trùng, dùng thứ tự danh mục đã cấu hình.</p>
          <label className="flex items-center gap-2 text-sm"><input checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} type="checkbox" /> Thay bảng đã gán tại phạm vi này nếu có</label>
          <Button disabled={!hasTarget || !confirmed || assign.isPending} type="submit">Lưu lượt gán</Button>
        </fieldset>
      </form>
      {!guide.active ? <p className="text-sm text-gray-600">Kích hoạt bảng size để gán.</p> : null}
      {assign.isError || unassign.isError ? <p role="alert" className="text-sm text-danger-700">{(assign.error ?? unassign.error)?.message || 'Không thể cập nhật lượt gán.'}</p> : null}
      {assign.isSuccess ? <p role="status" className="text-sm">Đã lưu lượt gán.</p> : null}
    </section>
  );
}
