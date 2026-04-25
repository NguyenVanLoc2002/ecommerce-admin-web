import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/constants/queryKeys';
import { auditLogService } from '../services/auditLogService';
import type { AuditLogListParams } from '../types/auditLog.types';

export function useAuditLogs(params: AuditLogListParams) {
  return useQuery({
    queryKey: queryKeys.auditLog.list(params),
    queryFn: () => auditLogService.getList(params),
    staleTime: 30_000,
  });
}
