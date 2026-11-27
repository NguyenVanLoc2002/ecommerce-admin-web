import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import type { AxiosResponse } from 'axios';
import { apiClient } from '@/shared/lib/axios';
import { Button } from '@/shared/components/ui/Button';
import { AppError } from '@/shared/types/api.types';
import type { TaxEstimate } from '@/features/tax/taxService';

type Evidence = {
  issuerReference: string;
  series: string;
  invoiceNumber: string;
  externalReference: string;
  issuedAt: string;
};

type ExternalRecord = { evidence: Evidence; recordedAt: string; recordedBy: string };
type Preparation = {
  invoice: { invoiceId: string; invoiceCode: string; orderId: string };
  snapshot: { amounts: TaxEstimate };
  externalRecord?: ExternalRecord;
  canRecord: boolean;
};

const fieldClass = 'block w-full rounded-md border border-gray-300 p-2 text-sm';
const errorText = (error: unknown) => {
  if (error instanceof AppError && error.code === 'NOT_FOUND') return 'Chưa có snapshot thuế chính thức cho hóa đơn này.';
  if (error instanceof AppError && error.code !== 'FORBIDDEN') return error.message;
  return 'Không thể truy cập dữ liệu kế toán. Kiểm tra quyền truy cập hoặc thử lại.';
};

function saveFile(content: Blob, extension: string, invoiceId: string) {
  const anchor = document.createElement('a');
  const url = URL.createObjectURL(content);
  anchor.href = url;
  anchor.download = 'tax-preparation-' + invoiceId + '.' + extension;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function TaxInvoiceDocuments({ invoiceId }: { invoiceId: string }) {
  const endpoint = '/admin/tax/invoices/' + invoiceId;
  const [show, setShow] = useState(false);
  const preparation = useQuery({
    queryKey: ['tax-invoice-preparation', invoiceId],
    queryFn: () => apiClient.get<Preparation>(endpoint + '/preparation'),
    retry: false,
    enabled: show,
  });
  const record = useMutation({
    mutationFn: (payload: Evidence) => apiClient.put<ExternalRecord>(endpoint + '/external-record', payload),
    onSuccess: () => { void preparation.refetch(); },
  });
  const csv = useMutation({
    mutationFn: () => apiClient.get<AxiosResponse<Blob>>(endpoint + '/preparation.csv', { responseType: 'blob' }),
    onSuccess: (file) => saveFile(file.data, 'csv', invoiceId),
  });

  const data = preparation.data;
  const external = data?.externalRecord ?? record.data;
  return (
    <details className="mt-5 rounded-lg border border-gray-200 bg-white p-4"
      onToggle={(event) => setShow(event.currentTarget.open)}>
      <summary className="cursor-pointer text-sm font-semibold">Dữ liệu kế toán và hóa đơn thuế</summary>
      <div className="mt-4 space-y-4 text-sm">
        {show && preparation.isPending ? <p role="status">Đang tải dữ liệu kế toán…</p> : null}
        {preparation.isError ? <p role="alert">{errorText(preparation.error)}</p> : null}
        {data ? (
          <>
            <p>Dữ liệu từ snapshot thuế chính thức của hóa đơn nội bộ {data.invoice.invoiceCode}.</p>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="secondary" onClick={() => saveFile(
                new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }), 'json', invoiceId)}>Xuất JSON</Button>
              <Button type="button" variant="secondary" isLoading={csv.isPending} onClick={() => csv.mutate()}>Xuất CSV</Button>
            </div>
            {csv.isError ? <p role="alert">Không xuất được CSV.</p> : null}
            {external ? (
              <dl className="grid gap-3 border-t border-gray-200 pt-4 sm:grid-cols-2">
                <div><dt>Đơn vị phát hành</dt><dd className="break-all">{external.evidence.issuerReference}</dd></div>
                <div><dt>Ký hiệu và số phát hành</dt><dd className="break-all">{external.evidence.series} / {external.evidence.invoiceNumber}</dd></div>
                <div><dt>Mã chứng từ bên ngoài</dt><dd className="break-all">{external.evidence.externalReference}</dd></div>
                <div><dt>Thời điểm phát hành</dt><dd>{new Date(external.evidence.issuedAt).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}</dd></div>
              </dl>
            ) : data.canRecord ? (
              <form className="space-y-3 border-t border-gray-200 pt-4" onSubmit={(event) => {
                event.preventDefault();
                const values = new FormData(event.currentTarget);
                record.mutate({
                  issuerReference: String(values.get('issuerReference')),
                  series: String(values.get('series')),
                  invoiceNumber: String(values.get('invoiceNumber')),
                  externalReference: String(values.get('externalReference')),
                  issuedAt: new Date(String(values.get('issuedAt')) + ':00+07:00').toISOString(),
                });
              }}>
                <h3 className="font-semibold">Ghi nhận hóa đơn đã phát hành bên ngoài</h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label>Đơn vị phát hành<input className={fieldClass} name="issuerReference" maxLength={100} required /></label>
                  <label>Ký hiệu<input className={fieldClass} name="series" maxLength={40} required /></label>
                  <label>Số hóa đơn<input className={fieldClass} name="invoiceNumber" maxLength={80} required /></label>
                  <label>Mã chứng từ bên ngoài<input className={fieldClass} name="externalReference" maxLength={160} required /></label>
                  <label>Thời điểm phát hành (giờ Việt Nam)<input className={fieldClass} type="datetime-local" name="issuedAt" required /></label>
                </div>
                <Button type="submit" isLoading={record.isPending}>Ghi nhận chứng từ</Button>
                {record.isError ? <p role="alert">{errorText(record.error)}</p> : null}
              </form>
            ) : <p>Chưa ghi nhận thông tin phát hành bên ngoài.</p>}
          </>
        ) : null}
      </div>
    </details>
  );
}
