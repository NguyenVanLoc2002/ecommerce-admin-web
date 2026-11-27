import { Link, useNavigate, useParams } from 'react-router-dom';
import { routes } from '@/constants/routes';
import { AdminLayout } from '@/shared/components/layout/AdminLayout';
import { PageHeader } from '@/shared/components/layout/PageHeader';
import { Button } from '@/shared/components/ui/Button';
import { SizeGuideAssignments } from '../components/SizeGuideAssignments';
import { SizeGuideEditor } from '../components/SizeGuideEditor';
import { useCopySizeGuide, useSaveSizeGuide, useSizeGuide } from '../hooks/useSizeGuides';

export function SizeGuideEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const query = useSizeGuide(id);
  const save = useSaveSizeGuide(id);
  const copy = useCopySizeGuide();
  const guide = query.data;

  return (
    <AdminLayout>
      <div className="space-y-5">
        <Link className="text-sm text-primary-700 underline" to={routes.sizeGuides.list}>Quay lại bảng size</Link>
        <PageHeader title={guide?.name ?? (id ? 'Chỉnh sửa bảng size' : 'Tạo bảng size')} actions={guide ? (
          <Button isLoading={copy.isPending} onClick={() => copy.mutate(guide.id, { onSuccess: (created) => navigate(routes.sizeGuides.edit(created.id)) })} variant="secondary">Sao chép</Button>
        ) : undefined} />
        {id && query.isPending ? <p role="status">Đang tải…</p> : null}
        {id && query.isError ? <Button onClick={() => void query.refetch()} variant="secondary">Tải lại bảng size</Button> : null}
        {(!id || guide) ? <SizeGuideEditor guide={guide} key={guide ? guide.id + ':' + guide.version : 'new'} pending={save.isPending}
          onSave={(input) => save.mutate(input, { onSuccess: (saved) => { if (!id) navigate(routes.sizeGuides.edit(saved.id), { replace: true }); } })} /> : null}
        {save.isError || copy.isError ? <p role="alert" className="text-sm text-danger-700">{(save.error ?? copy.error)?.message || 'Không thể lưu bảng size.'}</p> : null}
        {save.isSuccess ? <p role="status" className="text-sm">Đã lưu bảng size.</p> : null}
        {guide ? <SizeGuideAssignments guide={guide} key={guide.id} /> : null}
      </div>
    </AdminLayout>
  );
}
