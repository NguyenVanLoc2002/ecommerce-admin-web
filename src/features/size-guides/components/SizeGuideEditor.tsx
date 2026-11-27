import { useState, type FormEvent } from 'react';
import { Button } from '@/shared/components/ui/Button';
import type { Column, Guide, GuideContent, GuideInput, Unit } from '../services/sizeGuideService';

type Cell = { min: string; max: string };
type DraftRow = { id: string; size: string; values: Partial<Record<string, Cell>> };
const fieldClass = 'w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm';
const emptyCell: Cell = { min: '', max: '' };
const makeKey = () => 'm_' + crypto.randomUUID().replace(/-/g, '').slice(0, 20);
const defaultColumn: Column = { key: 'width', label: '', unit: 'CM' };

export function SizeGuideEditor({ guide, pending, onSave }: {
  guide?: Guide;
  pending: boolean;
  onSave: (input: GuideInput) => void;
}) {
  const [name, setName] = useState(guide?.name ?? '');
  const [active, setActive] = useState(guide?.active ?? false);
  const [measurement, setMeasurement] = useState(guide?.content.measurement ?? 'BODY');
  const [columns, setColumns] = useState(guide?.content.columns ?? [defaultColumn]);
  const [rows, setRows] = useState<DraftRow[]>(() => guide?.content.rows.map((row) => ({
    id: makeKey(),
    size: row.size,
    values: Object.fromEntries(Object.entries(row.values).map(([key, value]) => [key, {
      min: String(value.min), max: value.max == null ? '' : String(value.max),
    }])),
  })) ?? [{ id: makeKey(), size: '', values: {} }]);
  const [image, setImage] = useState(guide?.content.measurementImageUrl ?? '');
  const [notes, setNotes] = useState(guide?.content.notes ?? '');

  const updateColumn = (key: string, fields: Partial<Pick<Column, 'label' | 'unit'>>) =>
    setColumns((items) => items.map((column) => column.key === key ? { ...column, ...fields } : column));
  const updateRow = (id: string, fn: (row: DraftRow) => DraftRow) =>
    setRows((items) => items.map((row) => row.id === id ? fn(row) : row));

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const content: GuideContent = {
      measurement,
      columns: columns.map((column) => ({ ...column, label: column.label.trim() })),
      rows: rows.map((row) => ({
        size: row.size.trim(),
        values: Object.fromEntries(columns.map(({ key }) => {
          const cell = row.values[key] ?? emptyCell;
          return [key, { min: Number(cell.min), ...(cell.max ? { max: Number(cell.max) } : {}) }];
        })),
      })),
      measurementImageUrl: image.trim() || null,
      notes: notes.trim() || null,
    };
    onSave({ name: name.trim(), active, version: guide?.version, content });
  };

  return (
    <form className="space-y-6" onSubmit={submit}>
      <fieldset className="space-y-5 rounded-lg border border-gray-200 bg-white p-4 md:p-6" disabled={pending}>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-medium">Tên bảng size<input className={fieldClass} maxLength={120} onChange={(event) => setName(event.target.value)} required value={name} /></label>
          <label className="text-sm font-medium">Loại số đo
            <select className={fieldClass} onChange={(event) => setMeasurement(event.target.value === 'GARMENT' ? 'GARMENT' : 'BODY')} value={measurement}>
              <option value="BODY">Số đo cơ thể</option><option value="GARMENT">Số đo thành phẩm</option>
            </select>
          </label>
        </div>
        <label className="flex items-center gap-2 text-sm font-medium"><input checked={active} onChange={(event) => setActive(event.target.checked)} type="checkbox" /> Đang sử dụng</label>
        <section aria-label="Cột số đo" className="space-y-2">
          <h2 className="font-semibold">Cột số đo</h2>
          {columns.map((column, index) => (
            <div className="grid grid-cols-[minmax(0,1fr)_minmax(74px,0.45fr)_auto] items-end gap-2" key={column.key}>
              <label className="text-sm">Tên cột {index + 1}<input className={fieldClass} maxLength={80} onChange={(event) => updateColumn(column.key, { label: event.target.value })} required value={column.label} /></label>
              <label className="text-sm">Đơn vị<select className={fieldClass} onChange={(event) => updateColumn(column.key, { unit: event.target.value as Unit })} value={column.unit}>
                <option value="CM">cm</option><option value="IN">inch</option><option value="KG">kg</option>
              </select></label>
              <Button aria-label={'Xóa cột ' + (index + 1)} disabled={columns.length === 1} onClick={() => setColumns((items) => items.filter((item) => item.key !== column.key))} type="button" variant="secondary">Xóa</Button>
            </div>
          ))}
          <Button disabled={columns.length >= 12} onClick={() => setColumns((items) => [...items, { ...defaultColumn, key: makeKey() }])} type="button" variant="secondary">Thêm cột</Button>
        </section>
        <section aria-label="Hàng kích cỡ" className="space-y-3">
          <h2 className="font-semibold">Hàng kích cỡ</h2>
          <p className="text-sm text-gray-600">Nhập mức tối thiểu. Điền mức tối đa khi cần trình bày khoảng số đo.</p>
          {rows.map((row, index) => (
            <div className="space-y-2 border-t border-gray-200 pt-3" key={row.id}>
              <div className="flex items-end justify-between gap-3">
                <label className="w-40 text-sm">Size {index + 1}<input className={fieldClass} maxLength={24} onChange={(event) => updateRow(row.id, (current) => ({ ...current, size: event.target.value }))} required value={row.size} /></label>
                <Button aria-label={'Xóa hàng ' + (index + 1)} disabled={rows.length === 1} onClick={() => setRows((items) => items.filter((item) => item.id !== row.id))} type="button" variant="secondary">Xóa hàng</Button>
              </div>
              <div className="grid gap-2 md:grid-cols-2">
                {columns.map((column, columnIndex) => (
                  <fieldset className="grid grid-cols-2 gap-2" key={column.key}>
                    <legend className="text-sm font-medium">{column.label || 'Cột ' + (columnIndex + 1)}</legend>
                    {(['min', 'max'] as const).map((bound) => (
                      <label className="text-sm" key={bound}>{bound === 'min' ? 'Tối thiểu' : 'Tối đa'}
                        <input
                          className={fieldClass}
                          max="99999.999"
                          min={bound === 'max' ? row.values[column.key]?.min || '0' : '0'}
                          onChange={(event) => updateRow(row.id, (current) => ({
                            ...current,
                            values: { ...current.values, [column.key]: { ...(current.values[column.key] ?? emptyCell), [bound]: event.target.value } },
                          }))}
                          required={bound === 'min'}
                          step="0.001"
                          type="number"
                          value={row.values[column.key]?.[bound] ?? ''}
                        />
                      </label>
                    ))}
                  </fieldset>
                ))}
              </div>
            </div>
          ))}
          <Button disabled={rows.length >= 40} onClick={() => setRows((items) => [...items, { id: makeKey(), size: '', values: {} }])} type="button" variant="secondary">Thêm size</Button>
        </section>
        <label className="block text-sm font-medium">URL ảnh hướng dẫn đo
          <input className={fieldClass} maxLength={500} onChange={(event) => setImage(event.target.value)} placeholder="https://…" type="url" value={image} />
        </label>
        <label className="block text-sm font-medium">Ghi chú chọn size
          <textarea className={fieldClass} maxLength={1200} onChange={(event) => setNotes(event.target.value)} rows={3} value={notes} />
        </label>
        <Button type="submit" isLoading={pending}>Lưu bảng size</Button>
      </fieldset>
    </form>
  );
}
