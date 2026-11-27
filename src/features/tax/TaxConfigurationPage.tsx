import { useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { productService } from '@/features/products/services/productService';
import { AdminLayout } from '@/shared/components/layout/AdminLayout';
import { PageHeader } from '@/shared/components/layout/PageHeader';
import { Button } from '@/shared/components/ui/Button';
import { AppError } from '@/shared/types/api.types';
import { taxService, type TaxCategory, type TaxRate, type TaxSchedule, type TaxTreatment } from './taxService';

const queryKey = ['tax-configuration'];
const inputClass = 'w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm';
const uuidPattern = '[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}';
const fmt = new Intl.NumberFormat('vi-VN');
const msg = (error: unknown) => error instanceof AppError && error.code !== 'FORBIDDEN'
  ? error.message : 'Không thể truy cập dữ liệu thuế. Kiểm tra quyền hoặc thử tải lại.';

function CategoryForm({ category, onSaved }: { category?: TaxCategory; onSaved: (code: string) => void }) {
  const [code, setCode] = useState(category?.code ?? '');
  const [name, setName] = useState(category?.name ?? '');
  const [treatment, setTreatment] = useState<TaxTreatment>(category?.treatment ?? 'TAXABLE');
  const [active, setActive] = useState(category?.active ?? true);
  const save = useMutation({
    mutationFn: () => category
      ? taxService.update(category.code, { name: name.trim(), active })
      : taxService.create({ code, name: name.trim(), treatment }),
    onSuccess: (result) => onSaved(result.code),
  });

  return (
    <form className="space-y-3" onSubmit={(event) => { event.preventDefault(); save.mutate(); }}>
      <h2 className="font-semibold">{category ? 'Thông tin nhóm thuế' : 'Tạo nhóm thuế'}</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="space-y-1 text-sm">Mã nhóm
          <input required className={inputClass} value={code} disabled={Boolean(category)}
            pattern="[A-Z][A-Z0-9_]{1,39}" onChange={(event) => setCode(event.target.value.toUpperCase())} />
        </label>
        <label className="space-y-1 text-sm">Tên hiển thị
          <input required className={inputClass} maxLength={150} value={name} onChange={(event) => setName(event.target.value)} />
        </label>
        <label className="space-y-1 text-sm">Cách xử lý thuế
          <select className={inputClass} value={treatment} disabled={Boolean(category)}
            onChange={(event) => setTreatment(event.target.value as TaxTreatment)}>
            <option value="TAXABLE">Chịu thuế</option>
            <option value="NON_TAXABLE">Không chịu thuế</option>
          </select>
        </label>
        {category ? (
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={active} onChange={(event) => setActive(event.target.checked)} /> Hoạt động
          </label>
        ) : null}
      </div>
      {save.isError ? <p role="alert" className="text-sm text-danger-700">{msg(save.error)}</p> : null}
      <Button type="submit" isLoading={save.isPending}>Lưu nhóm thuế</Button>
    </form>
  );
}

function ScheduleForm({ schedule, onSaved }: { schedule: TaxSchedule; onSaved: (code: string) => void }) {
  const [rows, setRows] = useState(() => schedule.rates.map((rate, index) => ({ id: index.toString(), ...rate })));
  const { code, revision } = schedule.category;
  const save = useMutation({
    mutationFn: () => taxService.configure(code, revision, rows.map(({ fraction, effectiveFrom, effectiveUntil, active }) => ({
      fraction, effectiveFrom, effectiveUntil, active,
    }))),
    onSuccess: () => onSaved(code),
  });
  const change = (id: string, next: Partial<TaxRate>) =>
    setRows((current) => current.map((row) => row.id === id ? { ...row, ...next } : row));

  return (
    <form className="space-y-4 border-t border-gray-200 pt-5" onSubmit={(event) => { event.preventDefault(); save.mutate(); }}>
      <h2 className="font-semibold">Lịch thuế suất · Lần sửa {revision}</h2>
      {rows.map((rate) => (
        <fieldset key={rate.id} className="grid items-end gap-2 rounded-md border border-gray-200 p-3 sm:grid-cols-3">
          <label className="space-y-1 text-sm">Thuế suất (phần số thập phân)
            <input className={inputClass} type="number" required min="0" max="1" step="0.00000001" value={rate.fraction}
              onChange={(event) => change(rate.id, { fraction: event.target.valueAsNumber })} />
          </label>
          <label className="space-y-1 text-sm">Ngày bắt đầu
            <input className={inputClass} type="date" required value={rate.effectiveFrom}
              onChange={(event) => change(rate.id, { effectiveFrom: event.target.value })} />
          </label>
          <label className="space-y-1 text-sm">Ngày kết thúc (không bao gồm)
            <input className={inputClass} type="date" value={rate.effectiveUntil ?? ''}
              onChange={(event) => change(rate.id, { effectiveUntil: event.target.value || null })} />
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={rate.active} onChange={(event) => change(rate.id, { active: event.target.checked })} /> Áp dụng
          </label>
          <Button type="button" size="sm" variant="ghost" onClick={() => setRows((current) => current.filter((entry) => entry.id !== rate.id))}>Bỏ dòng</Button>
        </fieldset>
      ))}
      {save.isError ? <p role="alert" className="text-sm text-danger-700">{msg(save.error)}</p> : null}
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="secondary" disabled={rows.length >= 100}
          onClick={() => setRows((current) => [...current, { id: crypto.randomUUID(), fraction: 0, effectiveFrom: '', effectiveUntil: null, active: true }])}>Thêm kỳ</Button>
        <Button type="submit" isLoading={save.isPending} disabled={rows.length === 0 || save.isPending}>Lưu lịch thuế</Button>
      </div>
    </form>
  );
}

function ProductAssignment({ categories }: { categories: TaxCategory[] }) {
  const [search, setSearch] = useState('');
  const [keyword, setKeyword] = useState('');
  const [loadedId, setLoadedId] = useState('');
  const products = useQuery({
    queryKey: [...queryKey, 'products', keyword],
    queryFn: () => productService.getList({ keyword, page: 0, size: 10, isDeleted: false }),
    enabled: Boolean(keyword),
  });
  const mutation = useMutation({
    mutationFn: ({ id, code }: { id: string; code: string | null }) => taxService.assign(id, code),
  });
  const client = useQueryClient();
  const assignment = useQuery({ queryKey: [...queryKey, 'assignment', loadedId], queryFn: () => taxService.assignment(loadedId), enabled: Boolean(loadedId), retry: false });

  const selectProduct = (event: FormEvent) => {
    event.preventDefault();
    mutation.reset();
    setLoadedId('');
    setKeyword(search.trim());
  };

  return (
    <section className="space-y-3 border-t border-gray-200 pt-5">
      <h2 className="font-semibold">Gán nhóm thuế cho sản phẩm</h2>
      <form className="flex max-w-lg items-end gap-2" onSubmit={selectProduct}>
        <label className="flex-1 space-y-1 text-sm">Tìm sản phẩm
          <input className={inputClass} value={search} required onChange={(event) => setSearch(event.target.value)} />
        </label>
        <Button type="submit" variant="secondary">Tìm kiếm</Button>
      </form>
      {products.fetchStatus === 'fetching' ? <p role="status">Đang tìm sản phẩm…</p> : null}
      {products.isError ? <p role="alert">{msg(products.error)}</p> : null}
      {products.data?.items.length === 0 ? <p className="text-sm">Không tìm thấy sản phẩm.</p> : null}
      {products.data?.items.length ? (
        <ul className="max-w-lg divide-y divide-gray-200 rounded-md border border-gray-200">
          {products.data.items.map((product) => (
            <li key={product.id}>
              <button className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 aria-pressed:bg-primary-50"
                type="button" aria-pressed={loadedId === product.id}
                onClick={() => { mutation.reset(); setLoadedId(product.id); }}>
                {product.name}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      {products.data?.hasNext ? <p className="text-sm text-gray-600">Nhập tên cụ thể hơn để thu hẹp kết quả.</p> : null}
      {assignment.isFetching ? <p role="status">Đang tải nhóm thuế…</p> : null}
      {assignment.isError ? <p role="alert">{msg(assignment.error)}</p> : null}
      {assignment.data ? (
        <form key={loadedId + ':' + assignment.data.categoryCode} className="flex max-w-lg items-end gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            const code = String(new FormData(event.currentTarget).get('category') ?? '') || null;
            mutation.mutate({ id: loadedId, code }, { onSuccess: (result) => client.setQueryData([...queryKey, 'assignment', loadedId], result) });
          }}>
          <label className="flex-1 space-y-1 text-sm">Nhóm thuế của sản phẩm
            <select className={inputClass} name="category" defaultValue={assignment.data.categoryCode ?? ''}>
              <option value="">Mặc định của shop</option>
              {categories.filter((category) => category.active || category.code === assignment.data?.categoryCode).map((category) => (
                <option key={category.code} value={category.code} disabled={!category.active}>{category.name}</option>
              ))}
            </select>
          </label>
          <Button type="submit" isLoading={mutation.isPending}>Lưu</Button>
        </form>
      ) : null}
      {mutation.isSuccess ? <p role="status">Đã lưu nhóm thuế của sản phẩm.</p> : null}
      {mutation.isError ? <p role="alert">{msg(mutation.error)}</p> : null}
    </section>
  );
}

function AuditHistory({ code }: { code: string }) {
  const [before, setBefore] = useState(0);
  const audit = useQuery({ queryKey: [...queryKey, 'audit', code, before], queryFn: () => taxService.audit(code, before) });
  return (
    <section className="space-y-2 border-t border-gray-200 pt-5">
      <h2 className="font-semibold">Lịch sử thay đổi</h2>
      {audit.isPending ? <p role="status">Đang tải lịch sử…</p> : null}
      {audit.isError ? <p role="alert">{msg(audit.error)}</p> : null}
      {audit.data?.length === 0 ? <p className="text-sm text-gray-600">Chưa có lần thay đổi.</p> : null}
      <ul className="divide-y divide-gray-200">
        {audit.data?.map((entry) => (
          <li key={entry.id} className="py-2 text-sm">
            <details>
              <summary className="cursor-pointer">{entry.event} · {new Date(entry.changedAt).toLocaleString('vi-VN')}</summary>
              <p className="my-2 break-words">Tài khoản {entry.actor}</p>
              <pre className="overflow-auto whitespace-pre-wrap break-words">{entry.details}</pre>
            </details>
          </li>
        ))}
      </ul>
      {before > 0 ? <Button type="button" variant="secondary" onClick={() => setBefore(0)}>Mới nhất</Button> : null}
      {audit.data?.length === 20 ? (
        <Button type="button" variant="secondary" onClick={() => setBefore(audit.data![19].id)}>Cũ hơn</Button>
      ) : null}
    </section>
  );
}

function OrderEstimate() {
  const [id, setId] = useState('');
  const estimate = useMutation({ mutationFn: taxService.estimate });
  return (
    <section className="space-y-3 border-t border-gray-200 pt-5">
      <h2 className="font-semibold">Ước tính VAT của đơn hàng</h2>
      <form className="flex max-w-lg items-end gap-2" onSubmit={(event) => { event.preventDefault(); estimate.mutate(id.trim()); }}>
        <label className="flex-1 space-y-1 text-sm">ID đơn hàng
          <input className={inputClass} pattern={uuidPattern} required value={id} onChange={(event) => setId(event.target.value)} />
        </label>
        <Button type="submit" variant="secondary" isLoading={estimate.isPending}>Xem ước tính</Button>
      </form>
      {estimate.isError ? <p role="alert">{msg(estimate.error)}</p> : null}
      {estimate.data ? (
        <dl className="grid gap-2 text-sm sm:grid-cols-3">
          <div><dt>Tổng đã gồm thuế</dt><dd>{fmt.format(estimate.data.gross)} ₫</dd></div>
          <div><dt>Tổng trước thuế</dt><dd>{fmt.format(estimate.data.net)} ₫</dd></div>
          <div><dt>VAT ước tính</dt><dd>{fmt.format(estimate.data.vat)} ₫</dd></div>
        </dl>
      ) : null}
    </section>
  );
}

export function TaxConfigurationPage() {
  const client = useQueryClient();
  const [selected, setSelected] = useState<string>();
  const [status, setStatus] = useState('');
  const categories = useQuery({ queryKey: [...queryKey, 'categories'], queryFn: taxService.list, retry: false });
  const schedule = useQuery({ queryKey: [...queryKey, 'schedule', selected], queryFn: () => taxService.get(selected!), enabled: Boolean(selected) });
  const onSaved = (code: string) => {
    void client.invalidateQueries({ queryKey });
    setSelected(code);
    setStatus('Đã lưu thay đổi.');
  };
  return (
    <AdminLayout>
      <div className="space-y-5">
        <PageHeader title="Cấu hình VAT" actions={categories.isSuccess
          ? <Button type="button" onClick={() => { setSelected(undefined); setStatus(''); }}>Tạo nhóm</Button> : undefined} />
        {categories.isPending ? <p role="status">Đang tải nhóm thuế…</p> : null}
        {categories.isError ? <p role="alert">{msg(categories.error)}</p> : null}
        {status ? <p role="status">{status}</p> : null}
        {categories.isSuccess ? (
          <div className="grid items-start gap-6 lg:grid-cols-[minmax(15rem,1fr)_minmax(0,3fr)]">
            <nav aria-label="Danh sách nhóm thuế" className="divide-y divide-gray-200 rounded-md border border-gray-200 bg-white">
              {categories.data.map((category) => (
                <button type="button" key={category.code} aria-pressed={selected === category.code}
                  className="block w-full break-words px-4 py-3 text-left hover:bg-gray-50 aria-pressed:bg-primary-50"
                  onClick={() => { setSelected(category.code); setStatus(''); }}>
                  <span className="block text-sm font-medium">{category.name}</span>
                  <span className="text-sm text-gray-600">{category.code}{category.active ? '' : ' · Tạm dừng'}</span>
                </button>
              ))}
            </nav>
            <div className="min-w-0 space-y-5">
              {selected === undefined ? <CategoryForm key="new" onSaved={onSaved} /> : null}
              {selected && schedule.isPending ? <p role="status">Đang tải lịch thuế…</p> : null}
              {schedule.isError ? <p role="alert">{msg(schedule.error)}</p> : null}
              {schedule.data ? (
                <>
                  <CategoryForm key={schedule.data.category.code} category={schedule.data.category} onSaved={onSaved} />
                  <ScheduleForm key={schedule.data.category.code + ':' + schedule.data.category.revision} schedule={schedule.data} onSaved={onSaved} />
                  <AuditHistory key={schedule.data.category.code} code={schedule.data.category.code} />
                </>
              ) : null}
              <ProductAssignment categories={categories.data} />
              <OrderEstimate />
            </div>
          </div>
        ) : null}
      </div>
    </AdminLayout>
  );
}
