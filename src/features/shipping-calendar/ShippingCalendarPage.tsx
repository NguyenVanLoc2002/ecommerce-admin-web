import { useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AdminLayout } from '@/shared/components/layout/AdminLayout';
import { PageHeader } from '@/shared/components/layout/PageHeader';
import { Button } from '@/shared/components/ui/Button';
import { AppError } from '@/shared/types/api.types';
import { shippingCalendarService, type CalendarInput, type CalendarPurpose, type ShippingCalendar, type WorkingDay } from './shippingCalendarService';

const keys = ['shipping-calendars'];
const control = 'block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm';
const purposes: Record<CalendarPurpose, string> = {
  WAREHOUSE_PROCESSING: 'Xử lý tại kho',
  CARRIER_TRANSPORT: 'Vận chuyển',
};
const days: Record<WorkingDay, string> = {
  MONDAY: 'Thứ Hai', TUESDAY: 'Thứ Ba', WEDNESDAY: 'Thứ Tư', THURSDAY: 'Thứ Năm',
  FRIDAY: 'Thứ Sáu', SATURDAY: 'Thứ Bảy', SUNDAY: 'Chủ Nhật',
};
const zone = 'Asia/Ho_Chi_Minh';
const stamp = new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium', timeStyle: 'short', timeZone: zone });
const dateOnly = new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium', timeZone: 'UTC' });
const errorHint = (error: unknown) => error instanceof AppError && error.code !== 'FORBIDDEN'
  ? error.message : 'Không thể truy cập lịch vận hành. Kiểm tra quyền hoặc thử lại.';

function Pagination({ page, next, setPage }: { page: number; next?: boolean; setPage: (page: number) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      <Button type="button" size="sm" variant="secondary" disabled={page === 0} onClick={() => setPage(page - 1)}>Trang trước</Button>
      <Button type="button" size="sm" variant="secondary" disabled={!next} onClick={() => setPage(page + 1)}>Trang sau</Button>
    </div>
  );
}

function CalendarEditor({ saved, onSaved }: { saved?: ShippingCalendar; onSaved: (calendar: ShippingCalendar) => void }) {
  const [input, setInput] = useState<CalendarInput>(() => saved?.calendar ?? {
    name: '', purpose: 'WAREHOUSE_PROCESSING', workdays: [], opensAt: '', cutoffAt: '', closesAt: '', holidays: [], active: true,
  });
  const [holidayRows, setHolidayRows] = useState(() => input.holidays.map((holiday, i) => ({ ...holiday, key: String(i) })));
  const update = (edit: Partial<CalendarInput>) => setInput((current) => ({ ...current, ...edit }));
  const save = useMutation({
    mutationFn: () => {
      const body = { ...input, name: input.name.trim(), holidays: holidayRows.map(({ date, name }) => ({ date, name: name.trim() })) };
      return saved ? shippingCalendarService.edit(saved.id, saved.revision, body) : shippingCalendarService.create(body);
    },
    onSuccess: onSaved,
  });
  const editHoliday = (key: string, value: Partial<CalendarInput['holidays'][number]>) => {
    setHolidayRows((current) => current.map((row) => row.key === key ? { ...row, ...value } : row));
  };

  return (
    <form className="space-y-4" onSubmit={(event) => { event.preventDefault(); save.mutate(); }}>
      <h2 className="font-semibold">{saved ? 'Cấu hình lịch' : 'Tạo lịch vận hành'}</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="space-y-1 text-sm">Tên lịch
          <input className={control} required maxLength={150} value={input.name} onChange={(event) => update({ name: event.target.value })} />
        </label>
        <label className="space-y-1 text-sm">Mục đích
          <select className={control} value={input.purpose} disabled={Boolean(saved)}
            onChange={(event) => update({ purpose: event.target.value as CalendarPurpose })}>
            {Object.entries(purposes).map(([purpose, label]) => <option key={purpose} value={purpose}>{label}</option>)}
          </select>
        </label>
      </div>
      <fieldset className="space-y-2">
        <legend className="text-sm font-medium">Ngày làm việc</legend>
        <div className="flex flex-wrap gap-3">
          {(Object.keys(days) as WorkingDay[]).map((day) => (
            <label key={day} className="flex items-center gap-1.5 text-sm">
              <input type="checkbox" checked={input.workdays.includes(day)} onChange={(event) => update({
                workdays: event.target.checked ? [...input.workdays, day] : input.workdays.filter((entry) => entry !== day),
              })} /> {days[day]}
            </label>
          ))}
        </div>
      </fieldset>
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="space-y-1 text-sm">Mở cửa
          <input className={control} type="time" step="1" required value={input.opensAt} onChange={(event) => update({ opensAt: event.target.value })} />
        </label>
        <label className="space-y-1 text-sm">Hạn nhận xử lý trong ngày
          <input className={control} type="time" step="1" required value={input.cutoffAt} onChange={(event) => update({ cutoffAt: event.target.value })} />
        </label>
        <label className="space-y-1 text-sm">Đóng cửa
          <input className={control} type="time" step="1" required value={input.closesAt} onChange={(event) => update({ closesAt: event.target.value })} />
        </label>
      </div>
      <fieldset className="space-y-2">
        <legend className="text-sm font-medium">Ngày nghỉ</legend>
        {holidayRows.map((holiday) => (
          <div key={holiday.key} className="grid items-end gap-2 sm:grid-cols-[10rem_1fr_auto]">
            <label className="space-y-1 text-sm">Ngày
              <input className={control} type="date" required value={holiday.date} onChange={(event) => editHoliday(holiday.key, { date: event.target.value })} />
            </label>
            <label className="space-y-1 text-sm">Tên ngày nghỉ
              <input className={control} required maxLength={150} value={holiday.name} onChange={(event) => editHoliday(holiday.key, { name: event.target.value })} />
            </label>
            <Button type="button" variant="ghost" onClick={() => setHolidayRows((current) =>
              current.filter((entry) => entry.key !== holiday.key))}>Xóa ngày</Button>
          </div>
        ))}
        <Button type="button" size="sm" variant="secondary" disabled={holidayRows.length >= 730}
          onClick={() => setHolidayRows((current) => [...current, { key: crypto.randomUUID(), date: '', name: '' }])}>Thêm ngày nghỉ</Button>
      </fieldset>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={input.active} onChange={(event) => update({ active: event.target.checked })} /> Dùng lịch này
      </label>
      {save.isError ? <p role="alert" className="text-sm text-danger-700">{errorHint(save.error)}</p> : null}
      <Button type="submit" isLoading={save.isPending}
        disabled={save.isPending || !input.name.trim() || input.workdays.length === 0}>Lưu lịch</Button>
    </form>
  );
}

function Preview({ calendar }: { calendar: ShippingCalendar }) {
  const warehouse = calendar.calendar.purpose === 'WAREHOUSE_PROCESSING';
  const preview = useMutation({
    mutationFn: async (data: FormData) => {
      if (warehouse) {
        const date = new Date(String(data.get('eligibleAt')) + ':00+07:00').toISOString();
        const result = await shippingCalendarService.previewProcessing(calendar.id, date);
        return 'Bắt đầu xử lý lúc ' + stamp.format(new Date(result.processingStartsAt));
      }
      const result = await shippingCalendarService.previewDelivery(calendar.id, String(data.get('handoverDate')),
        Number(data.get('minimum')), Number(data.get('maximum')));
      return dateOnly.format(new Date(result.earliest)) + ' đến ' + dateOnly.format(new Date(result.latest));
    },
  });
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    preview.mutate(new FormData(event.currentTarget));
  };

  return (
    <form className="space-y-3 border-t border-gray-200 pt-4" onSubmit={submit}>
      <h2 className="font-semibold">Kiểm tra lịch đã lưu</h2>
      {warehouse ? (
        <label className="block max-w-sm space-y-1 text-sm">Thời điểm đơn đủ điều kiện (giờ Việt Nam)
          <input className={control} type="datetime-local" name="eligibleAt" required />
        </label>
      ) : (
        <div className="grid gap-3 sm:grid-cols-3">
          <label className="space-y-1 text-sm">Ngày bàn giao<input className={control} type="date" name="handoverDate" required /></label>
          <label className="space-y-1 text-sm">Ngày làm việc tối thiểu<input className={control} type="number" name="minimum" min="0" max="90" required /></label>
          <label className="space-y-1 text-sm">Ngày làm việc tối đa<input className={control} type="number" name="maximum" min="0" max="90" required /></label>
        </div>
      )}
      <Button type="submit" variant="secondary" isLoading={preview.isPending}>Tính thử</Button>
      {preview.isSuccess ? <p role="status" className="text-sm">{preview.data}</p> : null}
      {preview.isError ? <p role="alert" className="text-sm text-danger-700">{errorHint(preview.error)}</p> : null}
    </form>
  );
}

function History({ id }: { id: string }) {
  const [page, setPage] = useState(0);
  const history = useQuery({ queryKey: [...keys, 'history', id, page], queryFn: () => shippingCalendarService.history(id, page) });
  return (
    <section className="space-y-3 border-t border-gray-200 pt-4">
      <h2 className="font-semibold">Lịch sử thay đổi</h2>
      {history.isPending ? <p role="status">Đang tải lịch sử…</p> : null}
      {history.isError ? <p role="alert">{errorHint(history.error)}</p> : null}
      <ul className="divide-y divide-gray-200">
        {history.data?.items.map((change) => (
          <li key={change.revision} className="py-2 text-sm">
            <details>
              <summary className="cursor-pointer">Lần sửa {change.revision} · {stamp.format(new Date(change.changedAt))}</summary>
              <dl className="mt-2 space-y-1">
                <div><dt className="inline font-medium">Người sửa </dt><dd className="inline break-all">{change.changedBy}</dd></div>
                <div><dt className="inline font-medium">Lịch </dt><dd className="inline">{change.calendar.name}</dd></div>
                <div><dt className="inline font-medium">Ngày làm việc </dt><dd className="inline">{change.calendar.workdays.map((day) => days[day]).join(', ')}</dd></div>
                <div><dt className="inline font-medium">Hạn nhận </dt><dd className="inline">{change.calendar.cutoffAt}</dd></div>
                <div><dt className="inline font-medium">Ngày nghỉ </dt><dd className="inline">{change.calendar.holidays.length}</dd></div>
              </dl>
            </details>
          </li>
        ))}
      </ul>
      <Pagination page={page} next={history.data?.hasNext} setPage={setPage} />
    </section>
  );
}

export function ShippingCalendarPage() {
  const client = useQueryClient();
  const [page, setPage] = useState(0);
  const [selected, select] = useState<string>();
  const [message, setMessage] = useState('');
  const list = useQuery({ queryKey: [...keys, 'list', page], queryFn: () => shippingCalendarService.list(page), retry: false });
  const detail = useQuery({
    queryKey: [...keys, 'detail', selected], queryFn: () => shippingCalendarService.get(selected!),
    enabled: Boolean(selected) && list.isSuccess,
  });
  const changeSelection = (id?: string) => { select(id); setMessage(''); };
  const onSaved = (calendar: ShippingCalendar) => {
    client.setQueryData([...keys, 'detail', calendar.id], calendar);
    void client.invalidateQueries({ queryKey: [...keys, 'list'] });
    void client.invalidateQueries({ queryKey: [...keys, 'history', calendar.id] });
    select(calendar.id);
    setMessage('Đã lưu lịch vận hành.');
  };

  return (
    <AdminLayout>
      <div className="space-y-5">
        <PageHeader title="Lịch vận hành" actions={list.isSuccess
          ? <Button type="button" onClick={() => changeSelection()}>Tạo lịch</Button> : undefined} />
        {list.isPending ? <p role="status">Đang tải lịch vận hành…</p> : null}
        {list.isError ? <p role="alert">{errorHint(list.error)}</p> : null}
        {message ? <p role="status">{message}</p> : null}
        {list.isSuccess ? (
          <div className="grid items-start gap-6 lg:grid-cols-[minmax(14rem,1fr)_minmax(0,2fr)]">
            <section aria-label="Danh sách lịch" className="space-y-3">
              {list.data.items.length === 0 ? <p className="text-sm">Chưa có lịch vận hành.</p> : (
                <ul className="divide-y divide-gray-200 rounded-lg border border-gray-200 bg-white">
                  {list.data.items.map((calendar) => (
                    <li key={calendar.id}>
                      <button type="button" className="w-full px-4 py-3 text-left hover:bg-gray-50 aria-pressed:bg-primary-50"
                        aria-pressed={calendar.id === selected} onClick={() => changeSelection(calendar.id)}>
                        <span className="block break-words text-sm font-medium">{calendar.name}</span>
                        <span className="block text-sm text-gray-600">{purposes[calendar.purpose]}{calendar.active ? '' : ' · Tạm dừng'}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              <Pagination page={page} next={list.data.hasNext} setPage={setPage} />
            </section>
            <section className="min-w-0 space-y-5">
              <p className="text-sm text-gray-600">Múi giờ Việt Nam</p>
              {!selected ? <CalendarEditor key="new" onSaved={onSaved} /> : null}
              {selected && detail.isPending ? <p role="status">Đang tải cấu hình…</p> : null}
              {detail.isError ? <p role="alert">{errorHint(detail.error)}</p> : null}
              {detail.data ? (
                <>
                  <CalendarEditor key={detail.data.id + ':' + detail.data.revision} saved={detail.data} onSaved={onSaved} />
                  {detail.data.calendar.active ? <Preview key={detail.data.id + ':' + detail.data.revision} calendar={detail.data} /> : null}
                  <History key={detail.data.id} id={detail.data.id} />
                </>
              ) : null}
            </section>
          </div>
        ) : null}
      </div>
    </AdminLayout>
  );
}
