import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import type { AuditLogDetails } from '../types/auditLog.types';

interface AuditLogChangesCellProps {
  details: AuditLogDetails;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined || value === '') return '-';
  if (typeof value === 'object') return JSON.stringify(value, null, 2);
  return String(value);
}

function getDiffSides(details: AuditLogDetails) {
  if (!isRecord(details)) return null;

  const before = details.before ?? details.old ?? details.previous ?? null;
  const after = details.after ?? details.new ?? details.current ?? null;

  const beforeRecord = isRecord(before) ? before : null;
  const afterRecord = isRecord(after) ? after : null;

  if (beforeRecord === null && afterRecord === null) {
    return null;
  }

  return { before: beforeRecord, after: afterRecord };
}

function countChangedFields(
  before: Record<string, unknown> | null,
  after: Record<string, unknown> | null,
): number {
  if (!before) return Object.keys(after ?? {}).length;
  if (!after) return Object.keys(before).length;

  const allKeys = new Set([...Object.keys(before), ...Object.keys(after)]);
  let count = 0;

  for (const key of allKeys) {
    if (JSON.stringify(before[key]) !== JSON.stringify(after[key])) {
      count++;
    }
  }

  return count;
}

function getChangedKeys(
  before: Record<string, unknown> | null,
  after: Record<string, unknown> | null,
): string[] {
  if (!before) return Object.keys(after ?? {});
  if (!after) return Object.keys(before);

  const allKeys = new Set([...Object.keys(before), ...Object.keys(after)]);
  return [...allKeys].filter(
    (key) => JSON.stringify(before[key]) !== JSON.stringify(after[key]),
  );
}

export function AuditLogChangesCell({ details }: AuditLogChangesCellProps) {
  const [expanded, setExpanded] = useState(false);

  if (details === null || details === undefined || details === '') {
    return <span className="text-xs text-gray-400">-</span>;
  }

  if (typeof details === 'string') {
    return (
      <span className="block max-w-[320px] truncate text-xs text-gray-600" title={details}>
        {details}
      </span>
    );
  }

  const diff = getDiffSides(details);

  if (!diff) {
    const entries = Object.entries(details);

    return (
      <div className="text-xs">
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-gray-600 transition-colors hover:bg-gray-100"
        >
          {expanded ? (
            <ChevronDown className="h-3.5 w-3.5 shrink-0 text-gray-400" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5 shrink-0 text-gray-400" />
          )}
          <span>{entries.length} detail field{entries.length !== 1 ? 's' : ''}</span>
        </button>

        {expanded && (
          <div className="mt-2 overflow-hidden rounded-md border border-gray-200 bg-gray-50">
            <table className="min-w-full text-xs">
              <tbody className="divide-y divide-gray-100">
                {entries.map(([key, value]) => (
                  <tr key={key}>
                    <td className="w-28 px-3 py-1.5 font-mono font-medium text-gray-700 align-top">
                      {key}
                    </td>
                    <td className="max-w-[220px] break-all px-3 py-1.5 whitespace-pre-wrap text-gray-600 align-top">
                      {formatValue(value)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }

  const { before, after } = diff;
  const isCreate = !before && !!after;
  const isDelete = !!before && !after;
  const changedCount = countChangedFields(before, after);
  const changedKeys = getChangedKeys(before, after);

  const summary = isCreate
    ? 'New record'
    : isDelete
      ? 'Record deleted'
      : `${changedCount} field${changedCount !== 1 ? 's' : ''} changed`;

  return (
    <div className="text-xs">
      <button
        type="button"
        onClick={() => setExpanded((value) => !value)}
        className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-gray-600 transition-colors hover:bg-gray-100"
      >
        {expanded ? (
          <ChevronDown className="h-3.5 w-3.5 shrink-0 text-gray-400" />
        ) : (
          <ChevronRight className="h-3.5 w-3.5 shrink-0 text-gray-400" />
        )}
        <span className={cn(isDelete && 'text-danger-600', isCreate && 'text-success-600')}>
          {summary}
        </span>
      </button>

      {expanded && (
        <div className="mt-2 overflow-hidden rounded-md border border-gray-200 bg-gray-50">
          {changedKeys.length === 0 ? (
            <p className="px-3 py-2 text-xs text-gray-400">No field-level diff available.</p>
          ) : (
            <table className="min-w-full text-xs">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-100">
                  <th className="w-28 px-3 py-1.5 text-left font-medium text-gray-500">Field</th>
                  {!isCreate && (
                    <th className="px-3 py-1.5 text-left font-medium text-gray-500">Before</th>
                  )}
                  {!isDelete && (
                    <th className="px-3 py-1.5 text-left font-medium text-gray-500">After</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {changedKeys.map((key) => (
                  <tr key={key}>
                    <td className="px-3 py-1.5 font-mono font-medium text-gray-700 align-top">
                      {key}
                    </td>
                    {!isCreate && (
                      <td className="max-w-[200px] break-all bg-danger-50/40 px-3 py-1.5 whitespace-pre-wrap text-danger-700 align-top">
                        {formatValue(before?.[key])}
                      </td>
                    )}
                    {!isDelete && (
                      <td className="max-w-[200px] break-all bg-success-50/40 px-3 py-1.5 whitespace-pre-wrap text-success-700 align-top">
                        {formatValue(after?.[key])}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
