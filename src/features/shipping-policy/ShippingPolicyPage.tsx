import { useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AdminLayout } from '@/shared/components/layout/AdminLayout';
import { PageHeader } from '@/shared/components/layout/PageHeader';
import { Button } from '@/shared/components/ui/Button';
import { AppError } from '@/shared/types/api.types';
import { shippingPolicyService, type Policy, type PolicyStatus } from './shippingPolicyService';

const key = ['shipping-policy'];
const labels: Record<PolicyStatus, string> = {
  DRAFT: 'Bản nháp',
  PUBLISHED: 'Đã công bố',
  ARCHIVED: 'Đã lưu trữ',
};
const dateFormat = new Intl.DateTimeFormat('vi-VN', {
  dateStyle: 'short',
  timeStyle: 'short',
  timeZone: 'Asia/Ho_Chi_Minh',
});
const localInput = (value: string) => new Date(value)
  .toLocaleString('sv-SE', { timeZone: 'Asia/Ho_Chi_Minh' }).slice(0, 16).replace(' ', 'T');
const fieldClass = 'block w-full rounded-md border border-gray-300 px-3 py-2 text-sm';

const errorMessage = (error: unknown) =>
  error instanceof AppError ? error.message : 'Không thể xử lý yêu cầu. Vui lòng thử lại.';

function Pager({ page, hasNext, onChange }: { page: number; hasNext?: boolean; onChange: (page: number) => void }) {
  return (
    <div className="flex gap-2">
      <Button variant="secondary" size="sm" type="button" disabled={page === 0} onClick={() => onChange(page - 1)}>Trang trước</Button>
      <Button variant="secondary" size="sm" type="button" disabled={!hasNext} onClick={() => onChange(page + 1)}>Trang sau</Button>
    </div>
  );
}

function History({ version }: { version: number }) {
  const [page, setPage] = useState(0);
  const history = useQuery({ queryKey: [...key, 'history', version, page], queryFn: () => shippingPolicyService.history(version, page) });

  return (
    <section className="space-y-3 border-t border-gray-200 pt-5">
      <h2 className="font-semibold">Lịch sử thay đổi</h2>
      {history.isPending ? <p role="status">Đang tải lịch sử…</p> : null}
      {history.isError ? <p role="alert">{errorMessage(history.error)}</p> : null}
      <ul className="divide-y divide-gray-200">
        {history.data?.items.map((change) => (
          <li key={change.revision} className="py-2">
            <details>
              <summary className="cursor-pointer text-sm">
                Lần sửa {change.revision} · {labels[change.status]} · {dateFormat.format(new Date(change.changedAt))}
              </summary>
              <p className="my-2 break-words text-sm text-gray-600">Người thực hiện {change.actor}</p>
              <p className="mb-2 text-sm font-medium">{change.title}</p>
              <p className="whitespace-pre-wrap break-words text-sm">{change.content}</p>
            </details>
          </li>
        ))}
      </ul>
      <Pager page={page} hasNext={history.data?.hasNext} onChange={setPage} />
    </section>
  );
}

function PolicyForm({ policy, onSaved }: { policy?: Policy; onSaved: (policy: Policy) => void }) {
  const [title, setTitle] = useState(policy?.title ?? '');
  const [content, setContent] = useState(policy?.content ?? '');
  const [starts, setStarts] = useState(() => localInput(policy?.effectiveFrom ?? new Date().toISOString()));
  const save = useMutation({
    mutationFn: () => {
      const draft = { title: title.trim(), content: content.trim(), effectiveFrom: new Date(starts + ':00+07:00').toISOString() };
      return policy ? shippingPolicyService.edit(policy.version, policy.revision, draft) : shippingPolicyService.create(draft);
    },
    onSuccess: onSaved,
  });

  const submit = (event: FormEvent) => {
    event.preventDefault();
    save.mutate();
  };

  return (
    <form className="space-y-4" onSubmit={submit}>
      <label className="block space-y-1 text-sm font-medium">
        <span>Tiêu đề</span>
        <input className={fieldClass} maxLength={200} required value={title} onChange={(event) => setTitle(event.target.value)} />
      </label>
      <label className="block space-y-1 text-sm font-medium">
        <span>Bắt đầu hiệu lực (giờ Việt Nam)</span>
        <input className={fieldClass} type="datetime-local" required value={starts} onChange={(event) => setStarts(event.target.value)} />
      </label>
      <label className="block space-y-1 text-sm font-medium">
        <span>Nội dung</span>
        <textarea className={fieldClass} maxLength={20000} required rows={12} value={content} onChange={(event) => setContent(event.target.value)} />
      </label>
      {save.isError ? <p role="alert" className="text-sm text-danger-700">{errorMessage(save.error)}</p> : null}
      <Button type="submit" isLoading={save.isPending} disabled={save.isPending || !title.trim() || !content.trim()}>Lưu bản nháp</Button>
    </form>
  );
}

export function ShippingPolicyPage() {
  const client = useQueryClient();
  const [page, setPage] = useState(0);
  const [selection, setSelection] = useState<number | 'new'>();
  const [statusMessage, setStatusMessage] = useState('');
  const capabilities = useQuery({ queryKey: [...key, 'capabilities'], queryFn: shippingPolicyService.capabilities, retry: false });
  const permitted = capabilities.data?.canEdit || capabilities.data?.canPublish;
  const list = useQuery({ queryKey: [...key, 'list', page], queryFn: () => shippingPolicyService.list(page), enabled: Boolean(permitted) });
  const version = typeof selection === 'number' ? selection : undefined;
  const detail = useQuery({
    queryKey: [...key, 'detail', version],
    queryFn: () => shippingPolicyService.get(version!),
    enabled: version !== undefined && Boolean(permitted),
  });
  const policy = detail.data;
  const refresh = (saved: Policy, message: string) => {
    client.setQueryData([...key, 'detail', saved.version], saved);
    void client.invalidateQueries({ queryKey: [...key, 'list'] });
    void client.invalidateQueries({ queryKey: [...key, 'history', saved.version] });
    setSelection(saved.version);
    setStatusMessage(message);
  };
  const changeStatus = useMutation({
    mutationFn: ({ current, action }: { current: Policy; action: 'publish' | 'archive' }) =>
      shippingPolicyService.changeStatus(current.version, current.revision, action),
    onSuccess: (saved) => refresh(saved, saved.status === 'PUBLISHED' ? 'Đã công bố phiên bản.' : 'Đã lưu trữ phiên bản.'),
  });
  const select = (next: number | 'new') => {
    changeStatus.reset();
    setStatusMessage('');
    setSelection(next);
  };

  return (
    <AdminLayout>
      <div className="space-y-5">
        <PageHeader title="Chính sách giao hàng" actions={capabilities.data?.canEdit
          ? <Button type="button" onClick={() => select('new')}>Tạo bản nháp</Button> : undefined} />
        {capabilities.isPending ? <p role="status">Đang kiểm tra quyền…</p> : null}
        {capabilities.isError ? <p role="alert">{errorMessage(capabilities.error)}</p> : null}
        {capabilities.isSuccess && !permitted ? <p>Bạn chưa có quyền quản lý chính sách giao hàng.</p> : null}
        {statusMessage ? <p role="status">{statusMessage}</p> : null}
        {permitted ? (
          <div className="grid items-start gap-6 lg:grid-cols-[minmax(16rem,1fr)_minmax(0,2fr)]">
            <section aria-label="Các phiên bản" className="space-y-3">
              {list.isPending ? <p role="status">Đang tải phiên bản…</p> : null}
              {list.isError ? <p role="alert">{errorMessage(list.error)}</p> : null}
              {list.data?.items.length === 0 ? <p>Chưa có phiên bản chính sách.</p> : null}
              <ul className="divide-y divide-gray-200 rounded-lg border border-gray-200 bg-white">
                {list.data?.items.map((entry) => (
                  <li key={entry.version}>
                    <button type="button" aria-pressed={selection === entry.version}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 aria-pressed:bg-primary-50"
                      onClick={() => select(entry.version)}>
                      <span className="block break-words text-sm font-medium">{entry.title}</span>
                      <span className="block text-sm text-gray-600">Phiên bản {entry.version} · {labels[entry.status]}</span>
                    </button>
                  </li>
                ))}
              </ul>
              <Pager page={page} hasNext={list.data?.hasNext} onChange={setPage} />
            </section>
            <section className="min-w-0 space-y-4">
              {selection === 'new' && capabilities.data?.canEdit
                ? <PolicyForm key="new" onSaved={(saved) => refresh(saved, 'Đã lưu bản nháp.')} /> : null}
              {version !== undefined && detail.isPending ? <p role="status">Đang tải nội dung…</p> : null}
              {detail.isError ? <p role="alert">{errorMessage(detail.error)}</p> : null}
              {policy ? (
                <>
                  <h2 className="font-semibold">Phiên bản {policy.version} · {labels[policy.status]}</h2>
                  {policy.status === 'DRAFT' && capabilities.data?.canEdit ? (
                    <PolicyForm key={policy.version + ':' + policy.revision} policy={policy}
                      onSaved={(saved) => refresh(saved, 'Đã lưu bản nháp.')} />
                  ) : (
                    <>
                      <p className="text-sm text-gray-600">Hiệu lực từ {dateFormat.format(new Date(policy.effectiveFrom))}</p>
                      <h3 className="break-words font-medium">{policy.title}</h3>
                      <p className="whitespace-pre-wrap break-words text-sm">{policy.content}</p>
                    </>
                  )}
                  {capabilities.data?.canPublish && policy.status !== 'ARCHIVED' ? (
                    <div className="flex flex-wrap gap-2 border-t border-gray-200 pt-3">
                      {policy.status === 'DRAFT' ? (
                        <Button variant="secondary" type="button" disabled={!capabilities.data.publicationEnabled || changeStatus.isPending}
                          onClick={() => changeStatus.mutate({ current: policy, action: 'publish' })}>Công bố bản đã lưu</Button>
                      ) : null}
                      <Button variant="secondary" type="button" disabled={changeStatus.isPending}
                        onClick={() => changeStatus.mutate({ current: policy, action: 'archive' })}>Lưu trữ</Button>
                    </div>
                  ) : null}
                  {changeStatus.isError ? <p role="alert">{errorMessage(changeStatus.error)}</p> : null}
                  <History key={policy.version} version={policy.version} />
                </>
              ) : null}
            </section>
          </div>
        ) : null}
      </div>
    </AdminLayout>
  );
}
