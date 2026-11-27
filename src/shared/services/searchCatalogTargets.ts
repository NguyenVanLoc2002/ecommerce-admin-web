import { apiClient } from '@/shared/lib/axios';
import type { PaginatedResponse } from '@/shared/types/api.types';

export type CatalogTargetKind = 'products' | 'categories' | 'brands';

export function searchCatalogTargets(kind: CatalogTargetKind, keyword: string) {
  return apiClient.get<PaginatedResponse<{ id: string; name: string }>>('/admin/' + kind, {
    params: { size: 25, isDeleted: false, [kind === 'products' ? 'keyword' : 'name']: keyword || undefined },
  });
}
