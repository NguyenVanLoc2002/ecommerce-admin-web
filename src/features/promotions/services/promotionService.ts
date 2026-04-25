import { apiClient } from '@/shared/lib/axios';
import type { PaginatedResponse } from '@/shared/types/api.types';
import type {
  Promotion,
  PromotionSummary,
  PromotionRule,
  PromotionListParams,
  CreatePromotionRequest,
  UpdatePromotionRequest,
  CreateRuleRequest,
} from '../types/promotion.types';

export const promotionService = {
  getList: (params: PromotionListParams) =>
    apiClient.get<PaginatedResponse<PromotionSummary>>('/admin/promotions', { params }),

  getById: (id: number) => apiClient.get<Promotion>(`/admin/promotions/${id}`),

  create: (body: CreatePromotionRequest) =>
    apiClient.post<Promotion>('/admin/promotions', body),

  update: (id: number, body: UpdatePromotionRequest) =>
    apiClient.patch<Promotion>(`/admin/promotions/${id}`, body),

  remove: (id: number) => apiClient.delete(`/admin/promotions/${id}`),

  addRule: (promotionId: number, body: CreateRuleRequest) =>
    apiClient.post<PromotionRule>(`/admin/promotions/${promotionId}/rules`, body),

  removeRule: (promotionId: number, ruleId: number) =>
    apiClient.delete(`/admin/promotions/${promotionId}/rules/${ruleId}`),
};
