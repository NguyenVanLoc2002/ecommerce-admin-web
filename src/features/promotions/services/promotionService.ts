import { apiClient } from '@/shared/lib/axios';
import type { EntityId, PaginatedResponse } from '@/shared/types/api.types';
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

  getById: (id: EntityId) => apiClient.get<Promotion>(`/admin/promotions/${id}`),

  create: (body: CreatePromotionRequest) =>
    apiClient.post<Promotion>('/admin/promotions', body),

  update: (id: EntityId, body: UpdatePromotionRequest) =>
    apiClient.patch<Promotion>(`/admin/promotions/${id}`, body),

  remove: (id: EntityId) => apiClient.delete(`/admin/promotions/${id}`),

  addRule: (promotionId: EntityId, body: CreateRuleRequest) =>
    apiClient.post<PromotionRule>(`/admin/promotions/${promotionId}/rules`, body),

  removeRule: (promotionId: EntityId, ruleId: EntityId) =>
    apiClient.delete(`/admin/promotions/${promotionId}/rules/${ruleId}`),
};
