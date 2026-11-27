import { useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { carrierService } from '@/features/carriers/services/carrierService';
import { useWarehouseOptions } from '@/features/inventory/hooks/useWarehouseOptions';
import { AdminLayout } from '@/shared/components/layout/AdminLayout';
import { PageHeader } from '@/shared/components/layout/PageHeader';
import { Button } from '@/shared/components/ui/Button';
import { AppError } from '@/shared/types/api.types';
import { deliveryRuleService, type DeliveryRoute, type DeliveryRule, type DeliveryTerms } from './deliveryRuleService';

const key = ['delivery-estimate-rules'];
const field = 'block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm';
const dateTime = new Intl.DateTimeFormat('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', dateStyle: 'medium', timeStyle: 'short' });
const errorText = (error: unknown) => error instanceof AppError && error.code !== 'FORBIDDEN'
  ? error.message : 'Không truy cập được cấu hình tuyến. Kiểm tra quyền hoặc thử lại.';

function PageButtons({ page, hasNext, update }: { page: number; hasNext?: boolean; update: (page: number) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      <Button type="button" size="sm" variant="secondary" disabled={!page} onClick={() => update(page - 1)}>Trang trước</Button>
      <Button type="button" size="sm" variant="secondary" disabled={!hasNext} onClick={() => update(page + 1)}>Trang sau</Button>
    </div>
  );
}

function RuleEditor({ carrierId, rule, onSaved }: { carrierId: string; rule?: DeliveryRule; onSaved: (rule: DeliveryRule) => void }) {
  const [province, setProvince] = useState(rule?.route.provinceCode ?? '');
  const [active, setActive] = useState(rule?.terms.active ?? false);
  const provinces = useQuery({ queryKey: ['locations', 'provinces'], queryFn: deliveryRuleService.provinces });
  const wards = useQuery({
    queryKey: ['locations', 'wards', province], queryFn: () => deliveryRuleService.wards(province),
    enabled: Boolean(province) && !rule,
  });
  const warehouses = useWarehouseOptions();
  const calendars = useQuery({ queryKey: [...key, 'calendars'], queryFn: deliveryRuleService.calendars });
  const save = useMutation({
    mutationFn: ({ route, terms }: { route: DeliveryRoute; terms: DeliveryTerms }) => rule
      ? deliveryRuleService.edit(rule.id, rule.revision, terms) : deliveryRuleService.create(route, terms),
    onSuccess: onSaved,
  });
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const get = (name: string) => String(data.get(name) ?? '').trim();
    const route = rule?.route ?? {
      carrierId, serviceCode: get('serviceCode'), warehouseId: get('warehouseId'),
      provinceCode: province, wardCode: get('wardCode') || null,
    };
    const terms = {
      calendarId: get('calendarId'),
      minBusinessDays: Number(get('minimum')),
      maxBusinessDays: Number(get('maximum')),
      priority: Number(get('priority')),
      effectiveFrom: get('effectiveFrom'),
      effectiveUntil: get('effectiveUntil') || null,
      active,
      guaranteed: data.has('guaranteed'),
      coverageReference: get('coverage') || null,
    };
    save.mutate({ route, terms });
  };

  const terms = rule?.terms;
  const missingCalendar = terms && !calendars.data?.some((option) => option.id === terms.calendarId);
  const missingNewRouteOptions = !rule && (!provinces.data?.length || !warehouses.data?.length || wards.isError);
  return (
    <form className="space-y-4" onSubmit={submit}>
      <h2 className="font-semibold">{rule ? 'Điều kiện tuyến · Lần sửa ' + rule.revision : 'Thêm tuyến giao hàng'}</h2>
      {rule ? (
        <p className="text-sm text-gray-600">
          Dịch vụ {rule.route.serviceCode} · Tỉnh {rule.route.provinceCode}
          {rule.route.wardCode ? ' · Xã ' + rule.route.wardCode : ' · Toàn tỉnh'}
        </p>
      ) : (
        <fieldset className="grid gap-3 sm:grid-cols-2">
          <label className="space-y-1 text-sm">Mã dịch vụ carrier<input className={field} required maxLength={100} name="serviceCode" /></label>
          <label className="space-y-1 text-sm">Kho xuất
            <select className={field} required name="warehouseId" defaultValue="">
              <option value="" disabled>Chọn kho</option>
              {warehouses.data?.map((warehouse) => <option key={warehouse.id} value={warehouse.id}>{warehouse.name}</option>)}
            </select>
          </label>
          <label className="space-y-1 text-sm">Tỉnh/Thành phố
            <select className={field} required value={province} onChange={(event) => setProvince(event.target.value)}>
              <option value="" disabled>Chọn tỉnh/thành phố</option>
              {provinces.data?.map((item) => <option key={item.code} value={item.code}>{item.name}</option>)}
            </select>
          </label>
          <label className="space-y-1 text-sm">Xã/Phường/Đặc khu
            <select className={field} name="wardCode" key={province} disabled={!province || wards.isPending || wards.isError} defaultValue="">
              <option value="">Toàn tỉnh/thành phố</option>
              {wards.data?.map((item) => <option key={item.code} value={item.code}>{item.name}</option>)}
            </select>
          </label>
          {wards.isFetching && province ? <p role="status" className="text-sm">Đang tải xã/phường…</p> : null}
          {provinces.isError || warehouses.isError || wards.isError ? <p role="alert" className="text-sm">Không tải được danh mục địa chỉ hoặc kho.</p> : null}
          {provinces.data?.length === 0 ? <p className="text-sm">Danh mục tỉnh chưa được nạp.</p> : null}
        </fieldset>
      )}
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="space-y-1 text-sm">Lịch carrier
          <select className={field} name="calendarId" required defaultValue={terms?.calendarId ?? ''}>
            <option value="" disabled>Chọn lịch vận chuyển</option>
            {missingCalendar ? <option value={terms.calendarId}>Lịch hiện tại đang tạm dừng</option> : null}
            {calendars.data?.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
        </label>
        <label className="space-y-1 text-sm">Ngày tối thiểu
          <input className={field} name="minimum" type="number" required min="0" max="90" defaultValue={terms?.minBusinessDays} />
        </label>
        <label className="space-y-1 text-sm">Ngày tối đa
          <input className={field} name="maximum" type="number" required min="0" max="90" defaultValue={terms?.maxBusinessDays} />
        </label>
        <label className="space-y-1 text-sm">Độ ưu tiên (số thấp hơn trước)
          <input className={field} name="priority" type="number" required min="0" max="100000" defaultValue={terms?.priority} />
        </label>
        <label className="space-y-1 text-sm">Bắt đầu áp dụng
          <input className={field} name="effectiveFrom" type="date" required defaultValue={terms?.effectiveFrom} />
        </label>
        <label className="space-y-1 text-sm">Ngày kết thúc (không bao gồm)
          <input className={field} name="effectiveUntil" type="date" defaultValue={terms?.effectiveUntil ?? ''} />
        </label>
      </div>
      <label className="block space-y-1 text-sm">Mã xác nhận vùng phục vụ
        <input className={field} name="coverage" maxLength={200} required={active} defaultValue={terms?.coverageReference ?? ''} />
      </label>
      <div className="flex flex-wrap gap-4">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={active} onChange={(event) => setActive(event.target.checked)} /> Kích hoạt khi hợp lệ
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="guaranteed" defaultChecked={terms?.guaranteed} /> Có cam kết đã xác nhận
        </label>
      </div>
      {calendars.isError || save.isError ? <p role="alert" className="text-sm text-danger-700">{errorText(calendars.error ?? save.error)}</p> : null}
      {calendars.data?.length === 0 ? <p className="text-sm">Cần lịch carrier hoạt động để tạo tuyến.</p> : null}
      <Button type="submit" isLoading={save.isPending} disabled={save.isPending || !calendars.isSuccess || missingNewRouteOptions || (!rule && !calendars.data.length)}>
        Lưu tuyến
      </Button>
    </form>
  );
}

function RulePreview({ route }: { route: DeliveryRoute }) {
  const preview = useMutation({ mutationFn: (date: string) => deliveryRuleService.preview(route, date) });
  return (
    <form className="space-y-2 border-t border-gray-200 pt-4" onSubmit={(event) => {
      event.preventDefault();
      preview.mutate(String(new FormData(event.currentTarget).get('date')));
    }}>
      <h2 className="font-semibold">Kiểm tra tuyến tại một ngày</h2>
      <div className="flex max-w-md items-end gap-2">
        <label className="flex-1 space-y-1 text-sm">Ngày kiểm tra<input className={field} name="date" type="date" required /></label>
        <Button type="submit" variant="secondary" isLoading={preview.isPending}>Tính thử</Button>
      </div>
      {preview.isSuccess ? <p role="status" className="text-sm">{preview.data.estimate
        ? `${preview.data.estimate.minBusinessDays}–${preview.data.estimate.maxBusinessDays} ngày làm việc từ khi carrier nhận hàng · ${preview.data.estimate.guaranteed ? 'Có cam kết' : 'Dự kiến'}`
        : 'Không có tuyến đang hiệu lực.'}</p> : null}
      {preview.isError ? <p role="alert" className="text-sm text-danger-700">{errorText(preview.error)}</p> : null}
    </form>
  );
}

function RuleHistory({ id }: { id: string }) {
  const [page, setPage] = useState(0);
  const history = useQuery({ queryKey: [...key, 'history', id, page], queryFn: () => deliveryRuleService.history(id, page) });
  return (
    <section className="space-y-2 border-t border-gray-200 pt-4">
      <h2 className="font-semibold">Lịch sử tuyến</h2>
      {history.isError ? <p role="alert">{errorText(history.error)}</p> : null}
      {history.isPending ? <p role="status">Đang tải lịch sử…</p> : null}
      <ul className="space-y-2 text-sm">
        {history.data?.items.map((item) => <li key={item.revision} className="break-words">
          Lần sửa {item.revision} · {dateTime.format(new Date(item.changedAt))} · {item.changedBy}
        </li>)}
      </ul>
      <PageButtons page={page} hasNext={history.data?.hasNext} update={setPage} />
    </section>
  );
}

export function DeliveryRulePage() {
  const [carrier, setCarrier] = useState('');
  const [page, setPage] = useState(0);
  const [selected, select] = useState<DeliveryRule>();
  const [notice, setNotice] = useState('');
  const client = useQueryClient();
  const carriers = useQuery({
    queryKey: [...key, 'carriers'], queryFn: () => carrierService.getList({ page: 0, size: 100, sort: 'name,asc' }),
  });
  const list = useQuery({ queryKey: [...key, 'list', carrier, page], queryFn: () => deliveryRuleService.list(carrier, page), enabled: Boolean(carrier), retry: false });
  const onSaved = (rule: DeliveryRule) => {
    select(rule);
    setNotice('Đã lưu tuyến giao hàng.');
    void client.invalidateQueries({ queryKey: [...key, 'list'] });
    void client.invalidateQueries({ queryKey: [...key, 'history', rule.id] });
  };
  return (
    <AdminLayout>
      <div className="space-y-5">
        <PageHeader title="Tuyến dự kiến giao hàng" actions={list.isSuccess
          ? <Button type="button" onClick={() => { select(undefined); setNotice(''); }}>Thêm tuyến</Button> : undefined} />
        <label className="block max-w-sm space-y-1 text-sm">Đơn vị vận chuyển
          <select className={field} value={carrier} onChange={(event) => {
            setCarrier(event.target.value); select(undefined); setPage(0); setNotice('');
          }}>
            <option value="">Chọn đơn vị vận chuyển</option>
            {carriers.data?.items.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}
          </select>
        </label>
        {carriers.isError || list.isError ? <p role="alert">{errorText(carriers.error ?? list.error)}</p> : null}
        {carrier && list.isPending ? <p role="status">Đang tải tuyến…</p> : null}
        {notice ? <p role="status">{notice}</p> : null}
        {list.isSuccess ? (
          <div className="grid items-start gap-6 lg:grid-cols-[minmax(14rem,1fr)_minmax(0,2fr)]">
            <section aria-label="Các tuyến" className="space-y-3">
              {list.data.items.length === 0 ? <p className="text-sm">Carrier này chưa có tuyến.</p> : (
                <ul className="divide-y divide-gray-200 rounded-lg border border-gray-200 bg-white">
                  {list.data.items.map((rule) => <li key={rule.id}>
                    <button type="button" onClick={() => { select(rule); setNotice(''); }} aria-pressed={selected?.id === rule.id}
                      className="w-full break-words px-4 py-3 text-left text-sm hover:bg-gray-50 aria-pressed:bg-primary-50">
                      <span className="block font-medium">{rule.route.serviceCode}</span>
                      <span className="block text-gray-600">Tỉnh {rule.route.provinceCode}{rule.route.wardCode ? ' · Xã ' + rule.route.wardCode : ''}
                        {rule.terms.active ? ' · Áp dụng theo ngày' : ' · Tạm dừng'}</span>
                    </button>
                  </li>)}
                </ul>
              )}
              <PageButtons page={page} hasNext={list.data.hasNext} update={setPage} />
            </section>
            <section className="min-w-0 space-y-5">
              <RuleEditor key={selected ? selected.id + ':' + selected.revision : carrier} carrierId={carrier} rule={selected} onSaved={onSaved} />
              {selected ? (
                <>
                  <RulePreview key={selected.id + ':' + selected.revision} route={selected.route} />
                  <RuleHistory key={selected.id} id={selected.id} />
                </>
              ) : null}
            </section>
          </div>
        ) : null}
      </div>
    </AdminLayout>
  );
}
