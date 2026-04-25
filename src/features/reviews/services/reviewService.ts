import { apiClient } from '@/shared/lib/axios';
import type { PaginatedResponse } from '@/shared/types/api.types';
import type { Review, ReviewListParams, ModerateReviewRequest } from '../types/review.types';

// NOTE: Review endpoints live at /reviews (not /admin/reviews) per the API contract.
export const reviewService = {
  getPending: (params: ReviewListParams) =>
    apiClient.get<PaginatedResponse<Review>>('/reviews/pending', { params }),

  getById: (id: number) =>
    apiClient.get<Review>(`/reviews/${id}`),

  moderate: (id: number, body: ModerateReviewRequest) =>
    apiClient.patch<Review>(`/reviews/${id}/moderate`, body),

  remove: (id: number) =>
    apiClient.delete(`/reviews/${id}`),
};
