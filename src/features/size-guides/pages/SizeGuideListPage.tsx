import { useDeferredValue, useState } from 'react';
import { Link } from 'react-router-dom';
import { routes } from '@/constants/routes';
import { AdminLayout } from '@/shared/components/layout/AdminLayout';
import { PageHeader } from '@/shared/components/layout/PageHeader';
import { Button } from '@/shared/components/ui/Button';
import { useSizeGuides } from '../hooks/useSizeGuides';

export function SizeGuideListPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const guides = useSizeGuides(useDeferredValue(search.trim()), page);

  return (
    <AdminLayout>
      <div className="space-y-5">
        <PageHeader title="Bảng size" actions={<Link className="rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white" to={routes.sizeGuides.create}>Tạo bảng size</Link>} />
        <label className="block max-w-md text-sm font-medium">Tìm bảng size
          <input className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2" onChange={(event) => { setSearch(event.target.value); setPage(0); }} value={search} />
        </label>
        {guides.isPending ? <p role="status">Đang tải…</p> : null}
        {guides.isError ? <Button onClick={() => void guides.refetch()} variant="secondary">Tải lại bảng size</Button> : null}
        {guides.data?.items.length === 0 ? <p className="text-sm text-gray-600">Không tìm thấy bảng size.</p> : null}
        {guides.data?.items.length ? (
          <ul className="divide-y divide-gray-200 rounded-lg border border-gray-200 bg-white">
            {guides.data.items.map((guide) => (
              <li className="flex flex-wrap items-center justify-between gap-3 px-4 py-3" key={guide.id}>
                <Link className="break-words font-medium text-primary-700 hover:underline" to={routes.sizeGuides.edit(guide.id)}>{guide.name}</Link>
                <span className="text-sm text-gray-600">{guide.active ? 'Đang sử dụng' : 'Ngừng sử dụng'}</span>
              </li>
            ))}
          </ul>
        ) : null}
        <div className="flex gap-2">
          <Button disabled={page === 0} onClick={() => setPage((current) => current - 1)} variant="secondary">Trang trước</Button>
          <Button disabled={!guides.data?.hasNext} onClick={() => setPage((current) => current + 1)} variant="secondary">Trang sau</Button>
        </div>
      </div>
    </AdminLayout>
  );
}
