import type { PaginationParams } from '@/shared/types/api.types';
import type { AuditAction } from '@/shared/types/enums';

export interface AuditLogChanges {
  before: Record<string, unknown> | null;
  after: Record<string, unknown> | null;
}

export interface AuditLog {
  id: number;
  action: AuditAction;
  entityType: string;
  entityId: number;
  performedBy: string;
  performedAt: string;
  changes: AuditLogChanges | null;
}

export interface AuditLogListParams extends PaginationParams {
  action?: AuditAction;
  entityType?: string;
  performedBy?: string;
  from?: string;
  to?: string;
}
