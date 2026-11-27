import { apiClient } from '@/shared/lib/axios';
import type { PaginatedResponse } from '@/shared/types/api.types';

export type Unit = 'CM' | 'IN' | 'KG';
export type Scope = 'PRODUCT' | 'CATEGORY_BRAND' | 'BRAND' | 'CATEGORY' | 'SHOP';
export type Column = { key: string; label: string; unit: Unit };
export type Measure = { min: number; max?: number | null };
export type GuideContent = {
  measurement: 'BODY' | 'GARMENT';
  columns: Column[];
  rows: Array<{ size: string; values: Record<string, Measure> }>;
  measurementImageUrl?: string | null;
  notes?: string | null;
};
export type GuideSummary = { id: string; name: string; active: boolean; version: number };
export type Guide = GuideSummary & { content: GuideContent };
export type GuideInput = Omit<Guide, 'id' | 'version'> & { version?: number };
export type AssignmentInput = { scope: Scope; productId?: string; categoryId?: string; brandId?: string; priority: number };
export type Assignment = AssignmentInput & { key: string; guideId: string; productName?: string | null; categoryName?: string | null; brandName?: string | null };

const path = '/admin/size-guides';

export const sizeGuideService = {
  list: (search: string, page: number) => apiClient.get<PaginatedResponse<GuideSummary>>(path, { params: { search, page } }),
  get: (id: string) => apiClient.get<Guide>(path + '/' + id),
  save: (id: string | undefined, body: GuideInput) => id ? apiClient.put<Guide>(path + '/' + id, body) : apiClient.post<Guide>(path, body),
  copy: (id: string) => apiClient.post<Guide>(path + '/' + id + '/copy'),
  assignments: (id: string) => apiClient.get<Assignment[]>(path + '/' + id + '/assignments'),
  assign: (id: string, body: AssignmentInput) => apiClient.put<void>(path + '/' + id + '/assignments', body),
  unassign: (id: string, key: string) => apiClient.delete<void>(path + '/' + id + '/assignments/' + encodeURIComponent(key)),
};
