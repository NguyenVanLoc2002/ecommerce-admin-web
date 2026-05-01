import { apiClient } from '@/shared/lib/axios';
import type { EntityId, PaginatedResponse } from '@/shared/types/api.types';
import { cleanParams } from '@/shared/utils/cleanParams';
import { toSoftDeleteQuery } from '@/shared/utils/softDelete';
import type { Review, ReviewListParams, UpdateReviewStatusRequest } from '../types/review.types';

export const reviewService = {
  getList: ({ deletedState, sort, ...params }: ReviewListParams) =>
    apiClient.get<PaginatedResponse<Review>>('/admin/reviews', {
      params: cleanParams({
        ...params,
        ...toReviewSortParams(sort),
        ...toSoftDeleteQuery(deletedState),
      }),
    }),

  getById: (id: EntityId) =>
    apiClient.get<Review>(`/admin/reviews/${id}`),

  moderate: (id: EntityId, body: UpdateReviewStatusRequest) =>
    apiClient.patch<Review>(`/admin/reviews/${id}/status`, body),
};

function toReviewSortParams(sort?: string) {
  if (!sort) {
    return {};
  }

  const [field, direction] = sort.split(',');
  return {
    sort: field,
    direction,
  };
}
