import { useDeferredValue, useId, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { searchCatalogTargets, type CatalogTargetKind } from '@/shared/services/searchCatalogTargets';

const inputClass = 'w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm';

export function CatalogTargetPicker({ kind, label, value, onChange }: {
  kind: CatalogTargetKind;
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const selectId = useId();
  const [search, setSearch] = useState('');
  const keyword = useDeferredValue(search.trim());
  const results = useQuery({
    queryKey: ['catalog-targets', kind, keyword],
    queryFn: () => searchCatalogTargets(kind, keyword),
  });
  const items = results.data?.items ?? [];

  return (
    <div className="min-w-0 space-y-1.5">
      <label className="block text-sm font-medium">
        Tìm {label.toLowerCase()}
        <input className={inputClass} onChange={(event) => setSearch(event.target.value)} value={search} />
      </label>
      <label className="block text-sm font-medium" htmlFor={selectId}>{label}</label>
      <select id={selectId} className={inputClass} onChange={(event) => onChange(event.target.value)} value={value}>
          <option value="">Chọn {label.toLowerCase()}</option>
          {value && !items.some((item) => item.id === value) ? <option value={value}>{value}</option> : null}
          {items.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
      </select>
      {results.isPending ? <p role="status" className="text-sm">Đang tải…</p> : null}
      {results.isError ? <button type="button" className="text-sm underline" onClick={() => void results.refetch()}>Tải lại danh sách</button> : null}
      {results.isSuccess && items.length === 0 ? <p className="text-sm text-gray-500">Không tìm thấy kết quả.</p> : null}
      {results.data?.hasNext ? <p className="text-sm text-gray-500">Nhập tên để thu hẹp kết quả.</p> : null}
    </div>
  );
}
