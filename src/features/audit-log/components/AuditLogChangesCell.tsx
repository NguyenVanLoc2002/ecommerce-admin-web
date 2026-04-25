import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import type { AuditLogChanges } from '../types/auditLog.types';

interface AuditLogChangesCellProps {
  changes: AuditLogChanges | null;
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined) return '—';
  if (typeof value === 'object') return JSON.stringify(value, null, 2);
  return String(value);
}

function countChangedFields(changes: AuditLogChanges): number {
  // For creates/deletes, count the non-null side's keys
  if (!changes.before) return Object.keys(changes.after ?? {}).length;
  if (!changes.after) return Object.keys(changes.before).length;

  // For updates, count keys where values actually differ
  const allKeys = new Set([
    ...Object.keys(changes.before),
    ...Object.keys(changes.after),
  ]);
  let count = 0;
  for (const key of allKeys) {
    if (
      JSON.stringify(changes.before[key]) !== JSON.stringify(changes.after[key])
    ) {
      count++;
    }
  }
  return count;
}

function getChangedKeys(changes: AuditLogChanges): string[] {
  if (!changes.before) return Object.keys(changes.after ?? {});
  if (!changes.after) return Object.keys(changes.before);

  const allKeys = new Set([
    ...Object.keys(changes.before),
    ...Object.keys(changes.after),
  ]);
  return [...allKeys].filter(
    (key) =>
      JSON.stringify((changes.before as Record<string, unknown>)[key]) !==
      JSON.stringify((changes.after as Record<string, unknown>)[key]),
  );
}

export function AuditLogChangesCell({ changes }: AuditLogChangesCellProps) {
  const [expanded, setExpanded] = useState(false);

  if (!changes) {
    return <span className="text-xs text-gray-400">—</span>;
  }

  const isCreate = !changes.before && changes.after;
  const isDelete = changes.before && !changes.after;
  const changedCount = countChangedFields(changes);
  const changedKeys = getChangedKeys(changes);

  const summary = isCreate
    ? 'New record'
    : isDelete
      ? 'Record deleted'
      : `${changedCount} field${changedCount !== 1 ? 's' : ''} changed`;

  return (
    <div className="text-xs">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-gray-600 hover:bg-gray-100 transition-colors"
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
        <div className="mt-2 rounded-md border border-gray-200 bg-gray-50 overflow-hidden">
          {changedKeys.length === 0 ? (
            <p className="px-3 py-2 text-xs text-gray-400">No field-level diff available.</p>
          ) : (
            <table className="min-w-full text-xs">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-100">
                  <th className="px-3 py-1.5 text-left font-medium text-gray-500 w-28">Field</th>
                  {!isCreate && (
                    <th className="px-3 py-1.5 text-left font-medium text-gray-500">Before</th>
                  )}
                  {!isDelete && (
                    <th className="px-3 py-1.5 text-left font-medium text-gray-500">After</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {changedKeys.map((key) => {
                  const before = changes.before?.[key];
                  const after = changes.after?.[key];
                  return (
                    <tr key={key}>
                      <td className="px-3 py-1.5 font-mono font-medium text-gray-700 align-top">
                        {key}
                      </td>
                      {!isCreate && (
                        <td className="px-3 py-1.5 text-danger-700 bg-danger-50/40 align-top whitespace-pre-wrap max-w-[200px] break-all">
                          {formatValue(before)}
                        </td>
                      )}
                      {!isDelete && (
                        <td className="px-3 py-1.5 text-success-700 bg-success-50/40 align-top whitespace-pre-wrap max-w-[200px] break-all">
                          {formatValue(after)}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
