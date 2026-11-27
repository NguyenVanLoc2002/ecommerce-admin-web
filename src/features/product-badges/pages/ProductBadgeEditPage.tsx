import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { routes } from '@/constants/routes';
import { AdminLayout } from '@/shared/components/layout/AdminLayout';
import { PageHeader } from '@/shared/components/layout/PageHeader';
import { Button } from '@/shared/components/ui/Button';
import { ProductBadgeAssignments } from '../components/ProductBadgeAssignments';
import { useProductBadge, useSaveProductBadge } from '../hooks/useProductBadges';
import type { ProductBadge, ProductBadgeInput } from '../services/productBadgeService';

const inputClass = 'block w-full rounded-md border border-gray-300 px-3 py-2';

function BadgeForm({ badge, onSave, pending }: { badge?: ProductBadge; pending: boolean; onSave: (input: ProductBadgeInput) => void }) {
  const [draft, setDraft] = useState<ProductBadgeInput>(badge ?? { code: '', label: '', priority: 100, active: true });
  const change = (value: Partial<ProductBadgeInput>) => setDraft((current) => ({ ...current, ...value }));
  const submit = (event: FormEvent) => {
    event.preventDefault();
    const { label, code, active, priority } = draft;
    onSave({ label: label.trim(), code: code.trim().toUpperCase(), active, priority, version: badge?.version });
  };
  return (
    <form className="rounded-lg border border-gray-200 bg-white p-4 md:p-6" onSubmit={submit}>
      <fieldset className="space-y-4" disabled={pending}>
        <label className="block text-sm font-medium">Tên hiển thị<input className={inputClass} maxLength={60} onChange={(event) => change({ label: event.target.value })} required value={draft.label} /></label>
        <label className="block text-sm font-medium">Mã định danh<input className={inputClass} maxLength={40} onChange={(event) => change({ code: event.target.value.toUpperCase() })} pattern="[A-Z][A-Z0-9_]{0,39}" required value={draft.code} /></label>
        <label className="block text-sm font-medium">Độ ưu tiên<input className={inputClass} max={1000000} min={0} onChange={(event) => change({ priority: Number(event.target.value) })} required type="number" value={draft.priority} /></label>
        <p className="text-sm text-gray-600">Số nhỏ hơn được hiển thị trước.</p>
        <label className="flex items-center gap-2 text-sm font-medium"><input checked={draft.active} onChange={(event) => change({ active: event.target.checked })} type="checkbox" /> Đang sử dụng</label>
        <Button type="submit" isLoading={pending}>Lưu nhãn</Button>
      </fieldset>
    </form>
  );
}

export function ProductBadgeEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const query = useProductBadge(id);
  const mutation = useSaveProductBadge(id);
  const badge = query.data;
  return (
    <AdminLayout>
      <div className="space-y-5">
        <Link className="text-sm text-primary-700 underline" to={routes.productBadges.list}>Quay lại nhãn sản phẩm</Link>
        <PageHeader title={badge?.label ?? (id ? 'Chỉnh sửa nhãn' : 'Tạo nhãn')} />
        {id && query.isPending ? <p role="status">Đang tải…</p> : null}
        {id && query.isError ? <Button onClick={() => void query.refetch()} variant="secondary">Tải lại nhãn</Button> : null}
        {(!id || badge) ? <BadgeForm badge={badge} key={badge ? badge.id + ':' + badge.version : 'new'} pending={mutation.isPending}
          onSave={(body) => mutation.mutate(body, { onSuccess: (saved) => { if (!id) navigate(routes.productBadges.edit(saved.id), { replace: true }); } })} /> : null}
        {mutation.isError ? <p role="alert" className="text-sm text-danger-700">{mutation.error.message}</p> : null}
        {mutation.isSuccess ? <p role="status" className="text-sm">Đã lưu nhãn.</p> : null}
        {badge ? <ProductBadgeAssignments badge={badge} key={badge.id} /> : null}
      </div>
    </AdminLayout>
  );
}
