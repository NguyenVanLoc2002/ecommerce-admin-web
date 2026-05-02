import type { EntityId, PaginationParams } from '@/shared/types/api.types';
import type { AuditAction } from '@/shared/types/enums';

export type AuditLogDetails = Record<string, unknown> | string | null;

export interface AuditLog {
  id: EntityId;
  action: AuditAction;
  entityType: string;
  entityId: EntityId | null;
  actor: string;
  ipAddress: string | null;
  requestId: string | null;
  details: AuditLogDetails;
  createdAt: string;
}

export interface AuditLogListParams extends PaginationParams {
  action?: AuditAction;
  entityType?: string;
  entityId?: EntityId;
  actor?: string;
  fromDate?: string;
  toDate?: string;
}
