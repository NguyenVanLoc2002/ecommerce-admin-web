import { apiClient } from '@/shared/lib/axios';
import type { PaginatedResponse } from '@/shared/types/api.types';
import type { AuditLog, AuditLogListParams } from '../types/auditLog.types';

export const auditLogService = {
  getList: (params: AuditLogListParams) =>
    apiClient.get<PaginatedResponse<AuditLog>>('/admin/audit-logs', { params }),
};
