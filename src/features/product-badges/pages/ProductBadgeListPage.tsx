import { useState } from 'react';
import { Link } from 'react-router-dom';
import { routes } from '@/constants/routes';
import { AdminLayout } from '@/shared/components/layout/AdminLayout';
import { PageHeader } from '@/shared/components/layout/PageHeader';
import { Button } from '@/shared/components/ui/Button';
import { useProductBadges } from '../hooks/useProductBadges';

export function ProductBadgeListPage() {
  const [page, setPage] = useState(0);
  const badges = useProductBadges(page);
  return (
    <AdminLayout>
      <div className="space-y-5">
        <PageHeader title="Nhãn sản phẩm" actions={<Link className="rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white" to={routes.productBadges.create}>Tạo nhãn</Link>} />
        {badges.isPending ? <p role="status">Đang tải…</p> : null}
        {badges.isError ? <Button onClick={() => void badges.refetch()} variant="secondary">Tải lại nhãn</Button> : null}
        {badges.data?.items.length === 0 ? <p>Chưa có nhãn sản phẩm.</p> : null}
        {badges.data?.items.length ? (
          <ul className="divide-y divide-gray-200 rounded-lg border border-gray-200 bg-white">
            {badges.data.items.map((badge) => (
              <li className="flex flex-wrap items-center justify-between gap-3 px-4 py-3" key={badge.id}>
                <div><Link className="font-medium text-primary-700 hover:underline" to={routes.productBadges.edit(badge.id)}>{badge.label}</Link><p className="break-all text-xs text-gray-600">{badge.code}</p></div>
                <span className="text-sm text-gray-600">Ưu tiên {badge.priority} · {badge.active ? 'Đang sử dụng' : 'Ngừng sử dụng'}</span>
              </li>
            ))}
          </ul>
        ) : null}
        <div className="flex gap-2">
          <Button disabled={page === 0} onClick={() => setPage((current) => current - 1)} variant="secondary">Trang trước</Button>
          <Button disabled={!badges.data?.hasNext} onClick={() => setPage((current) => current + 1)} variant="secondary">Trang sau</Button>
        </div>
      </div>
    </AdminLayout>
  );
}
