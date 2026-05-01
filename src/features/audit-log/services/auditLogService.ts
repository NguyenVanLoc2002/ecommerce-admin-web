import { apiClient } from '@/shared/lib/axios';
import type { EntityId, PaginatedResponse } from '@/shared/types/api.types';
import { cleanParams } from '@/shared/utils/cleanParams';
import type { AuditLog, AuditLogListParams } from '../types/auditLog.types';

export const auditLogService = {
  async getList(params: AuditLogListParams): Promise<PaginatedResponse<AuditLog>> {
    const response = await apiClient.get<PaginatedResponse<unknown>>('/admin/audit-logs', {
      params: sanitizeAuditLogParams(params),
    });
    const items = Array.isArray(response.items) ? response.items : [];

    return {
      ...response,
      items: items.map((item) => normalizeAuditLog(item)),
    };
  },
};

function sanitizeAuditLogParams(params: AuditLogListParams) {
  return cleanParams({
    page: params.page,
    size: params.size,
    sort: normalizeString(params.sort),
    action: params.action,
    entityType: normalizeString(params.entityType),
    entityId: normalizeString(params.entityId),
    actor: normalizeString(params.actor),
    fromDate: normalizeString(params.fromDate),
    toDate: normalizeString(params.toDate),
  });
}

function normalizeAuditLog(input: unknown): AuditLog {
  const record = toRecord(input);

  return {
    id: asString(record.id),
    action: asString(record.action) as AuditLog['action'],
    entityType: asString(record.entityType),
    entityId: asNullableId(record.entityId),
    actor: asString(record.actor),
    ipAddress: asNullableString(record.ipAddress),
    requestId: asNullableString(record.requestId),
    details: normalizeDetails(record.details),
    createdAt: asString(record.createdAt),
  };
}

function normalizeDetails(value: unknown): AuditLog['details'] {
  if (value == null) return null;
  if (typeof value === 'string') return value;
  return toRecord(value);
}

function toRecord(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === 'object'
    ? (value as Record<string, unknown>)
    : {};
}

function asString(value: unknown): string {
  return typeof value === 'string' ? value : value == null ? '' : String(value);
}

function asNullableString(value: unknown): string | null {
  return value == null || value === '' ? null : String(value);
}

function asNullableId(value: unknown): EntityId | null {
  return value == null || value === '' ? null : String(value);
}

function normalizeString(value: string | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}
